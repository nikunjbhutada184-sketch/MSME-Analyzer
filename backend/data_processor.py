import os
import glob
import json
import pandas as pd
import logging
from typing import List, Dict

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Paths
DATA_DIR = r"E:\Artificial Intelligence\CourseProject\district wise MSME"
CACHE_PATH = r"E:\Artificial Intelligence\CourseProject\msme-analyzer\backend\processed_data.parquet"

def parse_activities(activity_str: str) -> List[str]:
    """Parse JSON activities and extract descriptions."""
    if pd.isna(activity_str):
        return []
    try:
        activities = json.loads(activity_str)
        return [act.get("Description", "") for act in activities if "Description" in act]
    except Exception:
        return []

def preprocess_data(force=False):
    """
    Reads all CSVs from the DATA_DIR, extracts District and Activities,
    parses the JSON to extract business descriptions, and saves as Parquet.
    """
    if os.path.exists(CACHE_PATH) and not force:
        logger.info(f"Cached data found at {CACHE_PATH}. Skipping preprocessing.")
        return pd.read_parquet(CACHE_PATH)

    logger.info("Starting data preprocessing. This may take a while...")
    
    csv_files = glob.glob(os.path.join(DATA_DIR, "*.csv"))
    if not csv_files:
        logger.error(f"No CSV files found in {DATA_DIR}")
        return pd.DataFrame()

    all_data = []

    for file in csv_files:
        try:
            logger.info(f"Processing {os.path.basename(file)}...")
            # We only need District, EnterpriseName, and Activities for matching
            df = pd.read_csv(file, usecols=['District', 'EnterpriseName', 'Activities'], on_bad_lines='skip')
            
            # Drop rows with no District or Activities
            df = df.dropna(subset=['District', 'Activities'])
            
            # Normalize District names (uppercase)
            df['District'] = df['District'].str.upper().str.strip()

            # Parse Activities to extract descriptions
            df['Descriptions'] = df['Activities'].apply(parse_activities)
            
            # Convert list of descriptions into a single string for matching
            df['BusinessDescription'] = df['Descriptions'].apply(lambda x: " | ".join(x))
            
            # Drop the raw Activities and Descriptions list to save space
            df = df.drop(columns=['Activities', 'Descriptions'])
            
            # Filter out empty descriptions
            df = df[df['BusinessDescription'].str.strip() != ""]
            
            all_data.append(df)
        except Exception as e:
            logger.error(f"Error processing {file}: {e}")

    if not all_data:
        logger.error("No valid data processed.")
        return pd.DataFrame()

    logger.info("Concatenating all district data...")
    final_df = pd.concat(all_data, ignore_index=True)
    
    logger.info(f"Saving processed data to {CACHE_PATH}...")
    final_df.to_parquet(CACHE_PATH, index=False)
    
    logger.info("Data preprocessing complete!")
    return final_df

if __name__ == "__main__":
    preprocess_data(force=True)

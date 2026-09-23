import os
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import logging
import numpy as np

logger = logging.getLogger(__name__)

CACHE_PATH = r"E:\Artificial Intelligence\CourseProject\msme-analyzer\backend\processed_data.parquet"

class MSMEMatcher:
    def __init__(self):
        self.df = None
        self.vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
        self.unique_descriptions = []
        self.tfidf_matrix = None
        
    def load_data(self):
        logger.info("Loading processed dataset...")
        if not os.path.exists(CACHE_PATH):
            raise FileNotFoundError(f"Processed data not found at {CACHE_PATH}. Run data_processor.py first.")
        
        self.df = pd.read_parquet(CACHE_PATH)
        
        logger.info("Extracting unique descriptions for TF-IDF...")
        # Get unique descriptions to optimize TF-IDF
        self.unique_descriptions = self.df['BusinessDescription'].unique()
        
        logger.info("Training TF-IDF model...")
        self.tfidf_matrix = self.vectorizer.fit_transform(self.unique_descriptions)
        logger.info("Matcher is ready.")
        
    def match(self, query: str, top_k_descriptions: int = 5, threshold: float = 0.1):
        if self.df is None:
            self.load_data()
            
        # Transform query
        query_vec = self.vectorizer.transform([query])
        
        # Calculate similarity with all unique descriptions
        similarities = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
        
        # Get top matches
        top_indices = similarities.argsort()[::-1][:top_k_descriptions]
        
        matched_descs = []
        for idx in top_indices:
            score = similarities[idx]
            if score >= threshold:
                matched_descs.append({
                    "description": self.unique_descriptions[idx],
                    "score": score
                })
                
        if not matched_descs:
            return {"matched_descriptions": [], "districts": {}, "summary": {}}
            
        # Get list of matched description strings
        matched_desc_strings = [m['description'] for m in matched_descs]
        
        # Filter dataframe for MSMEs that have these descriptions
        matched_df = self.df[self.df['BusinessDescription'].isin(matched_desc_strings)]
        
        # District-wise aggregation
        district_counts = matched_df.groupby('District').size().to_dict()
        
        # Calculate competition levels
        counts = list(district_counts.values())
        if counts:
            p33 = np.percentile(counts, 33)
            p66 = np.percentile(counts, 66)
        else:
            p33, p66 = 0, 0
            
        district_results = []
        for district, count in district_counts.items():
            if count <= p33:
                comp_level = "Low"
            elif count <= p66:
                comp_level = "Medium"
            else:
                comp_level = "High"
                
            district_results.append({
                "district": district,
                "count": int(count),
                "competition_level": comp_level
            })
            
        # Sort by count descending
        district_results = sorted(district_results, key=lambda x: x['count'], reverse=True)
        
        total_msmes = int(matched_df.shape[0])
        num_districts = len(district_results)
        
        highest_district = district_results[0]['district'] if num_districts > 0 else "None"
        lowest_district = district_results[-1]['district'] if num_districts > 0 else "None"
        
        return {
            "matched_descriptions": matched_descs,
            "districts": district_results,
            "summary": {
                "business_idea": query,
                "total_similar": total_msmes,
                "num_districts": num_districts,
                "highest_competition": highest_district,
                "lowest_competition": lowest_district
            }
        }

# Singleton instance
matcher = MSMEMatcher()

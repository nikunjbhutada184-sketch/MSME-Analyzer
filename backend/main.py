from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging

from matcher import matcher

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="MSME Analyzer API")

# Add CORS middleware to allow requests from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info("Initializing application and loading data...")
    try:
        matcher.load_data()
    except Exception as e:
        logger.error(f"Failed to load data: {e}")

@app.get("/api/analyze")
def analyze_business_idea(query: str):
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")
        
    try:
        results = matcher.match(query)
        return results
    except Exception as e:
        logger.error(f"Error during analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"message": "Welcome to the MSME Analyzer API"}

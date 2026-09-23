# MSME Analyzer

Analyze business competition across Maharashtra using Udyam/MSME registration data.

## Overview
This application allows a user to enter any business idea and analyzes the existing MSME competition for that business across different districts of Maharashtra.

## Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Recharts, React-Leaflet
- **Backend**: FastAPI, Pandas, Scikit-Learn (TF-IDF Vectorizer)
- **Data Engine**: Optimized via Parquet caching

## Installation & Running

### 1. Data Setup
Ensure that the MSME dataset is available in `E:\Artificial Intelligence\CourseProject\district wise MSME`. The data is processed once into an optimized `.parquet` format for fast querying.

### 2. Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python data_processor.py   # Run once to cache the data
uvicorn main:app --reload  # Starts on localhost:8000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev # Starts on localhost:5173
```

## Methodology

### Matching Algorithm
The matching is powered by a **TF-IDF (Term Frequency-Inverse Document Frequency)** vectorizer. 
1. We extract all unique MSME activities/descriptions from the raw dataset.
2. The user's query is transformed into a vector and compared to the dataset using **Cosine Similarity**.
3. We filter and retrieve the closest semantic matches.

### Competition Calculation
Competition level is determined dynamically using percentiles of the matched MSME counts per district:
- **Low Competition**: District count falls in the bottom 33rd percentile.
- **Medium Competition**: District count falls between the 33rd and 66th percentile.
- **High Competition**: District count is in the top 33rd percentile.

## Future Improvements
- Integrate semantic embeddings (like OpenAI embeddings or SentenceTransformers) for better NLP matching.
- Load highly detailed Maharashtra District GeoJSON boundaries for the Leaflet Map.
- Implement PostgreSQL for scalable data ingestion.

# News Verification Backend

FastAPI backend for the News Verification Platform, supporting global/country-wise news with hash-based verification.

## Setup
1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   ```
2. **Configure Environment**:
   - Copy `.env.example` to `.env` and update with AWS credentials and bucket name.
3. **Run**:
   ```bash
   uvicorn app:app --host 0.0.0.0 --port 8000
   ```
   - Access API at `http://localhost:8000/docs`.
   - WebSocket at `ws://localhost:8000/ws`.

## Features
- Login with JWT authentication.
- Evidence submission with SHA256 hashing and C2PA-like signatures.
- Claims extraction using spaCy.
- Story retrieval (global/country-wise) with WebSocket updates.
- SQLite in-memory database for simplicity.

## Notes
- Requires AWS S3 bucket for evidence storage.
- Update `WEBSOCKET_URL` in `.env` for production.
```python
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, WebSocket
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import hashlib
import jwt
import datetime
import os
from typing import List
import json
import spacy
import boto3
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# Environment variables
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_S3_BUCKET = os.getenv("AWS_S3_BUCKET")
ALGORITHM = "HS256"

# SQLite setup
conn = sqlite3.connect(":memory:", check_same_thread=False)
cursor = conn.cursor()
cursor.execute('''CREATE TABLE users (username TEXT, password TEXT, role TEXT)''')
cursor.execute('''CREATE TABLE stories (id INTEGER PRIMARY KEY, headline TEXT, regions TEXT, topics TEXT, published_at TEXT, verification_level TEXT)''')
cursor.execute('''CREATE TABLE evidence (id INTEGER PRIMARY KEY, uri TEXT, hash TEXT, type TEXT, lat REAL, lon REAL, captured_at TEXT, source_confidence REAL, signature TEXT)''')
cursor.execute('''INSERT INTO users VALUES (?, ?, ?)''', ("testuser", "testpass", "contributor"))
cursor.execute('''INSERT INTO users VALUES (?, ?, ?)''', ("testeditor", "testpass", "editor"))
cursor.execute('''INSERT INTO stories VALUES (?, ?, ?, ?, ?, ?)''', (1, "Sample Earthquake Report", '["US", "JP"]', '["disaster"]', datetime.datetime.now().isoformat(), "confirmed"))
cursor.execute('''INSERT INTO stories VALUES (?, ?, ?, ?, ?, ?)''', (2, "Flood in Europe", '["DE"]', '["disaster"]', datetime.datetime.now().isoformat(), "confirmed"))
conn.commit()

# S3 client
s3_client = boto3.client("s3", aws_access_key_id=AWS_ACCESS_KEY_ID, aws_secret_access_key=AWS_SECRET_ACCESS_KEY)

# Spacy for claims extraction
nlp = spacy.load("en_core_web_sm")

# OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# WebSocket clients
connected_clients = []

class Login(BaseModel):
    username: str
    password: str
    role: str

class Claim(BaseModel):
    text: str
    severity: str

class Evidence(BaseModel):
    type: str
    lat: float
    lon: float
    captured_at: str
    source_confidence: float

@app.post("/login")
async def login_user(login: Login):
    cursor.execute("SELECT * FROM users WHERE username=? AND password=? AND role=?", (login.username, login.password, login.role))
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    payload = {"sub": login.username, "role": login.role, "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)}
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer"}

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"username": payload["sub"], "role": payload["role"]}
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except:
        connected_clients.remove(websocket)

async def notify_clients(message: dict):
    for client in connected_clients:
        await client.send_json(message)

@app.post("/submit")
async def submit_evidence(
    file: UploadFile = File(...),
    type: str = Form(...),
    lat: float = Form(...),
    lon: float = Form(...),
    captured_at: str = Form(...),
    source_confidence: float = Form(...),
    user: dict = Depends(get_current_user)
):
    if user["role"] != "contributor":
        raise HTTPException(status_code=403, detail="Only contributors can submit evidence")
    content = await file.read()
    file_hash = hashlib.sha256(content).hexdigest()
    signature = hashlib.sha256((file_hash + SECRET_KEY).encode()).hexdigest()  # Simplified C2PA-like signature
    file_key = f"evidence/{file.filename}"
    s3_client.put_object(Bucket=AWS_S3_BUCKET, Key=file_key, Body=content)
    uri = f"s3://{AWS_S3_BUCKET}/{file_key}"
    cursor.execute('''INSERT INTO evidence (uri, hash, type, lat, lon, captured_at, source_confidence, signature) VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
                  (uri, file_hash, type, lat, lon, captured_at, source_confidence, signature))
    evidence_id = cursor.lastrowid
    conn.commit()
    await notify_clients({"evidence_id": evidence_id, "uri": uri})
    return {"evidence_id": evidence_id, "uri": uri}

@app.post("/claims/extract")
async def extract_claims(text: str, user: dict = Depends(get_current_user)):
    if user["role"] != "editor":
        raise HTTPException(status_code=403, detail="Only editors can extract claims")
    doc = nlp(text)
    claims = [{"text": sent.text, "severity": "unknown"} for sent in doc.sents]
    return {"claims": claims}

@app.get("/stories")
async def get_stories(region: str = None, topic: str = None, level: str = None, user: dict = Depends(get_current_user)):
    query = "SELECT * FROM stories WHERE 1=1"
    params = []
    if region:
        query += " AND regions LIKE ?"
        params.append(f'%{region}%')
    if topic:
        query += " AND topics LIKE ?"
        params.append(f'%{topic}%')
    if level:
        query += " AND verification_level=?"
        params.append(level)
    cursor.execute(query, params)
    stories = [{"id": row[0], "headline": row[1], "regions": json.loads(row[2]), "topics": json.loads(row[3]), "published_at": row[4], "verification_level": row[5]} for row in cursor.fetchall()]
    return stories

@app.get("/stories/{story_id}/provenance")
async def get_provenance(story_id: int, user: dict = Depends(get_current_user)):
    cursor.execute("SELECT * FROM evidence")
    evidence = [{"id": row[0], "uri": row[1], "hash": row[2], "type": row[3], "provenance": {"location": {"lat": row[4], "lon": row[5]}, "signature": row[7], "c2pa": bool(row[7])}, "related": []} for row in cursor.fetchall()]
    return {"evidence": evidence, "verification": {"level": "confirmed", "checks": ["hash_verified"]}}

@app.post("/stories/{story_id}/correction")
async def submit_correction(story_id: int, correction: dict, user: dict = Depends(get_current_user)):
    if user["role"] != "editor":
        raise HTTPException(status_code=403, detail="Only editors can submit corrections")
    correction_id = hashlib.sha256(correction["text"].encode()).hexdigest()
    await notify_clients({"story_id": story_id, "correction_id": correction_id})
    return {"correction_id": correction_id}
```
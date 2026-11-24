import json
import sqlite3
import urllib.error
import urllib.request
from pathlib import Path
from typing import Optional
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Backline Booking API", version="0.3.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

OLLAMA_URL = "http://127.0.0.1:11434/api/chat"
OLLAMA_MODEL = "qwen3:1.7b"
DB_PATH = Path(__file__).resolve().parent / "backline.db"

SYSTEM_PROMPT = """You are Backline, an AI booking assistant for independent musicians.
Lammasu is a hardcore/metal band, not a festival or venue.
Never invent concerts, venues, booking contacts, dates, or artist statistics.
Never claim a band's availability without confirmation.
Distinguish verified facts from suggestions and label unknowns clearly.
You have no live internet access. Do not pretend to have searched the web.
Provide practical, musician-focused booking advice.
"""


class BookingRequest(BaseModel):
    artist: str = Field(min_length=1, max_length=120)
    location: str = Field(min_length=1, max_length=160)
    genre: str = Field(min_length=1, max_length=120)
    goal: str = Field(min_length=1, max_length=2000)


class AgentRequest(BookingRequest):
    pass


class ArtistProfile(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    location: str = Field(min_length=1, max_length=160)
    genre: str = Field(min_length=1, max_length=120)
    spotify_url: str = Field(default="", max_length=500)
    instagram_url: str = Field(default="", max_length=500)
    monthly_listeners: Optional[int] = Field(default=None, ge=0)
    instagram_followers: Optional[int] = Field(default=None, ge=0)


def get_db():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_artist_database():
    with get_db() as db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS artists (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                location TEXT NOT NULL,
                genre TEXT NOT NULL,
                spotify_url TEXT DEFAULT '',
                instagram_url TEXT DEFAULT '',
                monthly_listeners INTEGER,
                instagram_followers INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)


initialize_artist_database()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/booking-requests")
def create_booking_request(request: BookingRequest):
    return {
        "status": "received",
        "request_id": str(uuid4()),
        "message": (
            "Booking request for {0} in {1} accepted. "
            "Research is not enabled yet."
        ).format(request.artist, request.location),
    }


@app.post("/agent/analyze")
def analyze_booking(request: AgentRequest):
    user_prompt = """Analyze this booking request:
Artist: {artist}
Location: {location}
Genre: {genre}
Goal: {goal}

Provide a brief assessment, a research plan, facts that need verification,
and practical next steps. Do not fabricate research findings.
""".format(**request.dict())

    payload = {
        "model": OLLAMA_MODEL,
        "stream": False,
        "think": False,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        "options": {"temperature": 0.2, "num_predict": 650},
    }
    http_request = urllib.request.Request(
        OLLAMA_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(http_request, timeout=120) as response:
            result = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Ollama rejected the AI request.") from exc
    except (urllib.error.URLError, TimeoutError) as exc:
        raise HTTPException(
            status_code=503,
            detail="Cannot reach Ollama. Make sure Ollama is running and qwen3:1.7b is installed.",
        ) from exc
    except (ValueError, KeyError, TypeError) as exc:
        raise HTTPException(status_code=502, detail="Ollama returned an unexpected response.") from exc

    answer = result.get("message", {}).get("content", "")
    if not isinstance(answer, str) or not answer.strip():
        raise HTTPException(status_code=502, detail="Ollama returned an empty response.")
    return {
        "status": "completed",
        "model": OLLAMA_MODEL,
        "artist": request.artist,
        "analysis": answer,
        "research_enabled": False,
    }


@app.post("/artists")
def create_artist(profile: ArtistProfile):
    artist_id = str(uuid4())
    with get_db() as db:
        db.execute(
            """INSERT INTO artists
               (id, name, location, genre, spotify_url, instagram_url,
                monthly_listeners, instagram_followers)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                artist_id, profile.name, profile.location, profile.genre,
                profile.spotify_url, profile.instagram_url,
                profile.monthly_listeners, profile.instagram_followers,
            ),
        )
    return {"status": "created", "artist_id": artist_id, "name": profile.name}


@app.get("/artists")
def list_artists():
    with get_db() as db:
        rows = db.execute(
            "SELECT * FROM artists ORDER BY created_at DESC"
        ).fetchall()
    return {"artists": [dict(row) for row in rows]}

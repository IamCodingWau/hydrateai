import os
import json
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

app = FastAPI(
    title="HydrateAI Local Backend",
    description="Privacy-preserving local AI engine for HydrateAI powered by Ollama (Qwen / Mistral).",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

class ReminderRequest(BaseModel):
    user_name: str
    current_intake_ml: int
    daily_goal_ml: int
    time_of_day: str
    personality: str = "encouraging"
    model: str = "qwen2.5:3b"

class DailySummaryRequest(BaseModel):
    user_name: str
    total_intake_ml: int
    daily_goal_ml: int
    logs_count: int
    streak_days: int = 1
    model: str = "qwen2.5:3b"

class AIResponse(BaseModel):
    message: str
    model_used: str
    source: str  # "local_ai" | "smart_fallback"
    insight_type: str

# Deterministic high-quality offline fallbacks when Ollama is offline/uninstalled
FALLBACK_REMINDERS = [
    "💧 Time for a quick water break! A single glass helps recharge your focus and energy.",
    "🌿 You're making steady progress toward your hydration goal. Grab a fresh sip!",
    "🌊 Gentle reminder to hydrate! Your brain and body will thank you.",
    "✨ Take a 30-second stretch and drink a cup of refreshing water.",
    "🌱 Small sips throughout the day make healthy habits last. Time for water!"
]

FALLBACK_SUMMARIES = [
    "Great effort prioritizing your wellness today! Staying hydrated keeps your mind clear and your energy stable.",
    "Every glass logged is a commitment to your long-term health. Rest well and keep the momentum going tomorrow!",
    "You did wonderfully listening to your body today. Remember, consistency beats perfection every single time."
]

@app.get("/api/health")
async def health_check():
    ollama_online = False
    available_models = []
    try:
        async with httpx.AsyncClient(timeout=1.5) as client:
            resp = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            if resp.status_code == 200:
                ollama_online = True
                data = resp.json()
                available_models = [m.get("name") for m in data.get("models", [])]
    except Exception:
        ollama_online = False

    return {
        "status": "healthy",
        "app": "HydrateAI",
        "ollama_connected": ollama_online,
        "ollama_endpoint": OLLAMA_BASE_URL,
        "available_models": available_models,
        "default_model_recommended": "qwen2.5:3b"
    }

@app.post("/api/ai/reminder", response_model=AIResponse)
async def generate_reminder(req: ReminderRequest):
    pct = round((req.current_intake_ml / max(1, req.daily_goal_ml)) * 100)
    prompt = (
        f"You are HydrateAI, a friendly, non-clinical wellness companion.\n"
        f"Context: The user's name is {req.user_name}. Current progress: {req.current_intake_ml}ml / {req.daily_goal_ml}ml ({pct}%).\n"
        f"Time of day: {req.time_of_day}. Tone: {req.personality}.\n"
        f"Task: Write a concise (1-2 sentences), warm, motivating reminder to drink water.\n"
        f"Crucial safety rules: Do NOT give medical diagnoses or claim water cures diseases. Keep it encouraging and under 35 words."
    )

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": req.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "num_predict": 60
                    }
                }
            )
            if resp.status_code == 200:
                text = resp.json().get("response", "").strip()
                if text:
                    return AIResponse(
                        message=text,
                        model_used=req.model,
                        source="local_ai",
                        insight_type="reminder"
                    )
    except Exception as e:
        # Graceful fallback on network/timeout/offline
        pass

    import random
    selected = random.choice(FALLBACK_REMINDERS)
    if pct >= 100:
        selected = f"🎉 Amazing job {req.user_name}! You've reached 100% of your daily water goal. Keep sipping as you feel comfortable!"

    return AIResponse(
        message=selected,
        model_used=f"{req.model} (offline fallback active)",
        source="smart_fallback",
        insight_type="reminder"
    )

@app.post("/api/ai/summary", response_model=AIResponse)
async def generate_daily_summary(req: DailySummaryRequest):
    pct = round((req.total_intake_ml / max(1, req.daily_goal_ml)) * 100)
    prompt = (
        f"You are HydrateAI wellness assistant.\n"
        f"Context: User {req.user_name} drank {req.total_intake_ml}ml out of their personal target of {req.daily_goal_ml}ml ({pct}%).\n"
        f"They logged water {req.logs_count} times today with a streak of {req.streak_days} days.\n"
        f"Task: Provide a 2-sentence encouraging daily reflection and habit tip.\n"
        f"Crucial safety rule: Never state medical facts or universal prescriptions. Celebrate consistency."
    )

    try:
        async with httpx.AsyncClient(timeout=4.5) as client:
            resp = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": req.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "num_predict": 80
                    }
                }
            )
            if resp.status_code == 200:
                text = resp.json().get("response", "").strip()
                if text:
                    return AIResponse(
                        message=text,
                        model_used=req.model,
                        source="local_ai",
                        insight_type="daily_summary"
                    )
    except Exception:
        pass

    import random
    base_fallback = random.choice(FALLBACK_SUMMARIES)
    msg = f"You logged {req.total_intake_ml}ml today ({pct}% of your target) across {req.logs_count} entries. {base_fallback}"
    return AIResponse(
        message=msg,
        model_used=f"{req.model} (offline fallback active)",
        source="smart_fallback",
        insight_type="daily_summary"
    )

from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="HRL WriteMuse API", version="1.0.0")

# Access Manager URL (Internal Docker network)
ACCESS_MANAGER_URL = os.getenv("ACCESS_MANAGER_URL", "http://hrl-webhook-hub-backend:9107")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health():
    return {"status": "healthy", "service": "writemuse"}

@app.post("/api/ai/writer")
async def ai_writer(data: dict, authorization: str = Header(None)):
    """
    AI Writer - Zintegrowany z systemem kredytów HRL.
    """
    email = data.get("email") # W docelowej wersji wyciągniemy z JWT
    if not email:
        raise HTTPException(status_code=400, detail="Missing user email")

    # 1. KROK 4: Konsumpcja 1 kredytu za akcję AI
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                f"{ACCESS_MANAGER_URL}/api/credits/consume",
                params={"email": email, "amount": 1}
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=402, detail="Insufficient credits or invalid access")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Access Manager Connection Error: {str(e)}")

    # 2. Jeśli kredyt pobrany - wykonaj logikę AI (Gemini/Groq)
    # Tu wstawimy docelowe wywołanie modelu LLM
    return {
        "status": "success",
        "message": "AI content generated",
        "data": "Sample AI story for " + email
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=9102, reload=True)

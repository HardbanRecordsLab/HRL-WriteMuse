from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(
    title="HRL WriteMuse API",
    description="AI Writing Assistant Backend for Hardban Records Lab",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "HRL WriteMuse API is online", "status": "ok"}

@app.get("/api/health")
async def health():
    return {"status": "healthy", "service": "writemuse"}

@app.post("/api/ai/writer")
async def ai_writer(data: dict):
    # This is a placeholder for the AI logic (Gemini/OpenAI) on the VPS
    return {"message": "AI process started (placeholder)", "received": data}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True)

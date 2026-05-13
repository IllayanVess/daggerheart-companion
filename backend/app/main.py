from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import initialize_app_tables
from app.routers import adversaries, characters, encounter_board, environments, lookup, npcs


@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize_app_tables()
    yield


app = FastAPI(title="Daggerheart Companion API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(adversaries.router, prefix="/api")
app.include_router(characters.router, prefix="/api")
app.include_router(encounter_board.router, prefix="/api")
app.include_router(environments.router, prefix="/api")
app.include_router(lookup.router, prefix="/api")
app.include_router(npcs.router, prefix="/api")


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Daggerheart Companion API"}


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "healthy"}
"""FastAPI application factory."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.config import APP_TITLE, APP_VERSION
from app.database import init_db
from app.routers import pages, words


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown lifecycle — create tables on boot."""
    init_db()
    yield


app = FastAPI(title=APP_TITLE, version=APP_VERSION, lifespan=lifespan)

# Static files (CSS, JS, images)
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Routers
app.include_router(words.router)
app.include_router(pages.router)

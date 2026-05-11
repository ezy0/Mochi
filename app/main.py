"""FastAPI application factory."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import APP_TITLE, APP_VERSION
from app.database import init_db
from app.routers import categories, pages, words


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown lifecycle — create tables on boot."""
    init_db()
    yield


class CacheControlStaticFiles(StaticFiles):
    def __init__(self, *args, cache_max_age: int = 3600, **kwargs):
        super().__init__(*args, **kwargs)
        self.cache_max_age = cache_max_age

    async def get_response(self, path, scope):
        response = await super().get_response(path, scope)
        if response.status_code in {200, 304}:
            response.headers.setdefault(
                "Cache-Control", f"public, max-age={self.cache_max_age}"
            )
            vary = response.headers.get("Vary")
            if vary:
                if "Accept-Encoding" not in vary:
                    response.headers["Vary"] = f"{vary}, Accept-Encoding"
            else:
                response.headers["Vary"] = "Accept-Encoding"
        return response


app = FastAPI(title=APP_TITLE, version=APP_VERSION, lifespan=lifespan)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Static files (CSS, JS, images)
app.mount(
    "/static",
    CacheControlStaticFiles(directory="app/static", cache_max_age=3600),
    name="static",
)

# Routers
app.include_router(words.router)
app.include_router(categories.router)
app.include_router(pages.router)

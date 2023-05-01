import logging
import firebase_admin
import pyrebase

from fastapi import FastAPI, Request, Response
from fastapi_redis_cache import FastApiRedisCache
from sqlalchemy.orm import Session
from starlette.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from firebase_admin import credentials, auth

from utility.database import Base, engine
from utility.database_ro import BaseRO, engine_ro
from utility.redis_util import redis_url
from app.resources.controller import api_router


logger = logging.getLogger(__name__)


def get_application() -> FastAPI:

    app = FastAPI(title="GPTogether", version="0.0.1")
    origins = ["*"]

    app.add_middleware(
        CORSMiddleware, 
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router)

    @app.on_event("startup")
    async def gptogether():
        load_dotenv()
        Base.metadata.create_all(bind=engine)
        BaseRO.metadata.create_all(bind=engine_ro)
        redis_cache = FastApiRedisCache()
        redis_cache.init(
            host_url=redis_url,
            prefix="gptogether-cache",
            response_header="x-api-cache",
            ignore_arg_types=[Request, Response, Session],
        )

    return app
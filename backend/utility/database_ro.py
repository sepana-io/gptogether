import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool


basedir = os.path.abspath(os.path.dirname(__file__))
CONFIG_MODE = os.environ.get("CONFIG_MODE", "DEV")


def get_uri(config):
    SQLALCHEMY_DATABASE_URI = "sqlite://"
    if config == "Production":
        SQLALCHEMY_DATABASE_URI = (
            "postgresql://{}:{}@{}:{}/{}?sslmode=require".format(
                os.environ.get("GPTOGETHER_DATABASE_USER"),
                os.environ.get("GPTOGETHER_DATABASE_PASSWORD"),
                os.environ.get("GPTOGETHER_DATABASE_HOST_RO"),
                os.environ.get("GPTOGETHER_DATABASE_PORT", 25061),
                os.environ.get("GPTOGETHER_CONNECTION_POOL_RO"),
            )
        )
    elif config == "DEV":
        SQLALCHEMY_DATABASE_URI = os.environ.get(
            "DATABASE_URL"
        ) or "sqlite:///" + os.path.join(basedir, "app.db")
    elif config == "TEST":
        SQLALCHEMY_DATABASE_URI = (
            os.environ.get("DATABASE_URL")
            or "sqlite:///"
            + os.path.join(basedir, "app.db")
            + "?check_same_thread=False"
        )
    return SQLALCHEMY_DATABASE_URI


def get_options(config=CONFIG_MODE):
    return (
        {"pool_pre_ping": True, "poolclass": StaticPool}
        if config == "TEST"
        else {}
    )


BaseRO = declarative_base()
engine_ro = create_engine(get_uri(CONFIG_MODE), **get_options())

SessionLocalRO = sessionmaker(bind=engine_ro)

import logging

from fastapi import (
    APIRouter,
    status,
    Body, 
    Depends
)
from utility.validate_utils import (
    validate_user
)
from utility.utils import decrypt_key
from fastapi_redis_cache import cache


logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/", status_code=status.HTTP_200_OK)
def gptogether_homepage(
    _: str = Depends(validate_user)
):
    return {
        "message": f"Hello from GPTogether!"
    }


@cache(expire=30)
@router.post("/decrypt_key", status_code=status.HTTP_200_OK)
def gptogether_decrypt_api_key(
    key: str = Body(..., embed=True),
    user_id = Depends(validate_user)
):
    return decrypt_key(key, user_id)
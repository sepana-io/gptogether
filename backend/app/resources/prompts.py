from fastapi import APIRouter
from fastapi import status, Security, Body, Depends
from typing import List
from fastapi_redis_cache import cache
from fastapi import HTTPException, status
from utility.validate_utils import (
    validate_user
)
from app.model import (
    GPTogetherAutoComplete
)
from utility.prompts_utils import (
    auto_complete_prompts
)


router = APIRouter()


@router.post("/suggest", status_code=status.HTTP_200_OK)
async def gptogether_auto_complete_prompts(
    prompt: GPTogetherAutoComplete, 
    _: str = Depends(validate_user)
):
    if not prompt.query:
        raise HTTPException(
            detail="Prompt query not provided",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
        )
    return auto_complete_prompts(
        query = prompt.query,
        top_n = prompt.top_n,
        max_words = prompt.max_words
    )
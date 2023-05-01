from fastapi import (
    APIRouter,
    status, 
    Body, 
    Depends
)
from typing import List
from fastapi_redis_cache import cache

from app.model import (
    GPTogetherUserOnboarding,
    GPTogetherUserUpdate,
    GPTogetherPrompts
)
from utility.user_utils import (
    fetch_user_info_by_email,
    fetch_user_info_by_user_id,
    onboard_user,
    update_user,
    fetch_users_info_by_userids,
    revoke_user,
    find_similar_users
)
from utility.validate_utils import (
    validate_user
)

router = APIRouter()


@cache(expire=60)
@router.get("/info_by_email", status_code=status.HTTP_200_OK)
async def gptogether_fetch_user_info_by_email(
    email: str, user_id: str = Depends(validate_user)
):
    return fetch_user_info_by_email(email, user_id)


@cache(expire=60)
@router.get("/info_by_user_id", status_code=status.HTTP_200_OK)
async def gptogether_fetch_user_info_by_user_id(
    user_id: str = Depends(validate_user)
):
    return fetch_user_info_by_user_id(user_id)


@router.post("/onboard_user", status_code=status.HTTP_201_CREATED)
async def gptogether_onboard_user(
    user_info: GPTogetherUserOnboarding, 
    user_id: str = Depends(validate_user)
):
    return onboard_user(user_info, user_id)


@router.post("/update_user_info", status_code=status.HTTP_200_OK)
async def gptogether_update_user_info(
    user_info: GPTogetherUserUpdate,
    user_id: str = Depends(validate_user),
):
    return update_user(user_info, user_id)


@cache(expire=60)
@router.post("/info_by_user_ids", status_code=status.HTTP_200_OK)
async def gptogether_multiple_users_info(
    user_ids: List[str] = Body(..., embed=True),
    _: str = Depends(validate_user),
):
    return fetch_users_info_by_userids(user_ids=user_ids)


@router.delete("/revoke", status_code=status.HTTP_200_OK)
async def gptogether_revoke_user(
    user_id: str = Depends(validate_user),
):
    return revoke_user(user_id)


@cache(expire=60)
@router.post("/find_similar_users", status_code=status.HTTP_200_OK)
async def gptogether_find_similar_users(
    prompts_meta: GPTogetherPrompts,
    user_id: str = Depends(validate_user),
):
    return find_similar_users(user_id, prompts_meta.prompts)

from fastapi import (
    APIRouter, 
    status,
    Body,
    Depends,
)
from fastapi_redis_cache import cache
from app.model import (
    GPTogetherConversationsIngest,
    UserConversationFilters,
    GPTogetherConversationsUpdate,
    GPTogetherShareState,
    GPTogetherSimilarConversation,
    GPTogetherSimilarLocation
)
from utility.conversation_utils import (
    create_conversation,
    list_conversations,
    fetch_conversation_by_id,
    fetch_conversation_by_did,
    delete_conversation,
    list_others_conversations,
    update_conversation,
    share_conversation_state,
    fetch_similar_conversations
)
from utility.validate_utils import (
    validate_user,
)


router = APIRouter()


@router.post("/create", status_code=status.HTTP_201_CREATED)
async def gptogether_create_conversation(
    conversation_meta:  GPTogetherConversationsIngest,
    user_id:str = Depends(validate_user)
):
    return create_conversation(conversation_meta, user_id)


@router.post("/list", status_code=status.HTTP_200_OK)
async def gptogether_list_conversations(
    filters: UserConversationFilters,
    user_id: str = Depends(validate_user)
):
    return list_conversations(
        user_id, 
        filters.page, 
        filters.sort_by
    )


@router.post("/list_others_conversations", status_code=status.HTTP_200_OK)
async def gptogether_list_others_conversations(
    filters: UserConversationFilters,
    others_user_id: str = Body(..., embed=True),
    user_id: str = Depends(validate_user)
):
    return list_others_conversations(
        user_id, 
        others_user_id,
        filters.page, 
        filters.sort_by
    )


@router.post("/fetch_by_id", status_code=status.HTTP_200_OK)
async def gptogether_fetch_conversation_by_id(
    conversation_id: str = Body(..., embed=True),
    user_id: str = Depends(validate_user)
):
    return fetch_conversation_by_id(
        conversation_id, 
        user_id
    )


@router.post("/fetch_by_document_id", status_code=status.HTTP_200_OK)
async def gptogether_fetch_conversation_by_did(
    document_id: str = Body(..., embed=True),
    user_id: str = Depends(validate_user)
):
    return fetch_conversation_by_did(
        document_id, 
        user_id
    )


@router.delete("/delete", status_code=status.HTTP_200_OK)
async def gptogether_delete_conversation(
    conversation_id: str = Body(..., embed=True),
    user_id: str = Depends(validate_user),
):
    return delete_conversation(conversation_id, user_id)


@router.post("/update", status_code=status.HTTP_200_OK)
async def gptogether_update_conversation(
    conversation_meta:  GPTogetherConversationsUpdate,
    user_id:str = Depends(validate_user)
):
    return update_conversation(conversation_meta, user_id)


@router.post("/share_state", status_code=status.HTTP_200_OK)
async def gptogether_share_conversation_state(
    share_object: GPTogetherShareState,
    user_id: str = Depends(validate_user)
):
    return share_conversation_state(share_object, user_id)


@cache(expire=30)
@router.post("/similar_conversations", status_code=status.HTTP_200_OK)
async def gptogether_fetch_similar_conversations(
    meta: GPTogetherSimilarConversation,
    user_id: str = Depends(validate_user)
):
    return fetch_similar_conversations(
        meta.conversation_id, 
        user_id,
        meta.prompts
    )


@cache(expire=30)
@router.post("/similar_location", status_code=status.HTTP_200_OK)
async def gptogether_fetch_similar_location(
    meta: GPTogetherSimilarLocation,
    user_id: str = Depends(validate_user)
):
    return fetch_similar_conversations(
        meta.location, 
        user_id,
    )
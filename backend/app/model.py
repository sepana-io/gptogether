from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, EmailStr
from sqlalchemy import (
    Column,
    String,
    DateTime,
    Boolean,
    ForeignKey,
    BigInteger,
    Integer,
    JSON,
)
from sqlalchemy.dialects.postgresql import JSONB
from utility.database import Base
from fastapi import Query


"""
User Onboarding and update
"""


class GPTogetherUserOnboarding(BaseModel):
    email: EmailStr
    type_of_login: str
    name: Optional[str] = Query(default=None, max_length=75)
    openai_api_key: Optional[str] = Query(default=None, max_length=100)
    twitter_handle: Optional[str] = Query(default=None, max_length=200)
    discord_handle: Optional[str] = Query(default=None, max_length=200)
    telegram_handle: Optional[str] = Query(default=None, max_length=200)
    instagram_handle: Optional[str] = Query(default=None, max_length=200)
    facebook_handle: Optional[str] = Query(default=None, max_length=200)
    youtube_channel: Optional[str] = Query(default=None, max_length=200)
    image_url: Optional[str]
    extra_metadata: Optional[Dict] = {}


class GPTogetherUserUpdate(BaseModel):
    user_id: str
    name: Optional[str] = Query(default=None, max_length=75)
    openai_api_key: Optional[str] = Query(default=None, max_length=100)
    twitter_handle: Optional[str] = Query(default=None, max_length=200)
    discord_handle: Optional[str] = Query(default=None, max_length=200)
    telegram_handle: Optional[str] = Query(default=None, max_length=200)
    instagram_handle: Optional[str] = Query(default=None, max_length=200)
    facebook_handle: Optional[str] = Query(default=None, max_length=200)
    youtube_channel: Optional[str] = Query(default=None, max_length=200)
    image_url: Optional[str]
    extra_metadata: Optional[Dict] = {}


class GPTogetherUser(Base):
    __tablename__ = "gptogether_users"
    user_id = Column(String, primary_key=True)
    email = Column(String, unique=True)
    type_of_login = Column(String)
    name = Column(String)
    openai_api_key = Column(String)
    twitter_handle = Column(String)
    discord_handle = Column(String)
    telegram_handle = Column(String)
    instagram_handle = Column(String)
    facebook_handle = Column(String)
    youtube_channel = Column(String)
    image_url = Column(String)
    extra_metadata = Column(JSON, default={})
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    nlp_user_id = Column(Integer)
    active = Column(Boolean, default=True)
    interests = Column(String)

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "email": self.email,
            "type_of_login": self.type_of_login,
            "name": self.name,
            "openai_api_key": self.openai_api_key,
            "twitter_handle": self.twitter_handle,
            "discord_handle": self.discord_handle,
            "telegram_handle": self.telegram_handle,
            "instagram_handle": self.instagram_handle,
            "facebook_handle": self.facebook_handle,
            "youtube_channel": self.youtube_channel,
            "image_url": self.image_url,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "nlp_user_id": self.nlp_user_id,
            "active": self.active,
            "interests": self.interests
        }


"""
Admin API key management
"""
class GPTogetherAdminKey(Base):
    __tablename__ = "gptogether_admin_api_key"
    api_id = Column(String, primary_key=True)
    api_key = Column(String, unique=True)
    revoked = Column(Boolean)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)


"""
Prompts aggregations examples
"""

class GPTogetherPrompts(BaseModel):
    prompts: Optional[List[str]]


"""
Conversation table
"""
class GPTogetherConversations(Base):
    __tablename__ = "gptogether_conversations"
    conversation_id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey(GPTogetherUser.user_id), primary_key=True)
    title_prompt = Column(String)
    storage_index = Column(String)
    total_prompts = Column(BigInteger, default=0)
    total_state_shares = Column(BigInteger, default=0)
    visibility_setting = Column(String)
    additional_metadata = Column(JSON)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)

    def to_dict(self):
        return {
            "conversation_id": self.conversation_id,
            "user_id": self.user_id,
            "title_prompt": self.title_prompt,
            "storage_index": self.storage_index,
            "total_prompts": self.total_prompts,
            "total_state_shares": self.total_state_shares,
            "visibility_setting": self.visibility_setting,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }


class GPTogetherVisibilityOptions(str, Enum):
    private = "private"
    history_exposed = "history_exposed"
    prompts_exposed = "prompts_exposed"


class GPTogetherShareState(BaseModel):
    document_id: str
    visibility_setting: GPTogetherVisibilityOptions


class GPTogetherConversationsIngest(BaseModel):
    title_prompt: str = Query(default=None, max_length=300)
    message: str = Query(default=None, max_length=300)
    visibility_setting: GPTogetherVisibilityOptions
    additional_metadata: Optional[Dict]


class GPTogetherConversationsUpdate(BaseModel):
    conversation_id: str
    title_prompt: Optional[str] = Query(default=None, max_length=300)
    message: Optional[str] = Query(default=None, max_length=300)
    visibility_setting: Optional[GPTogetherVisibilityOptions]
    additional_metadata: Optional[Dict]


class UserConversationFilters(BaseModel):
    page: Optional[int] = Query(default=1, ge=1, le=1000)
    sort_by: Optional[str] = Query(default="updated_at")


class GPTogetherSimilarConversation(BaseModel):
    conversation_id: Optional[str]
    prompts: Optional[List[str]]

"""
Auto-complete prompts input
"""

class GPTogetherAutoComplete(BaseModel):
    query: str
    top_n: Optional[int] = Query(10, ge=1, le=50)
    max_words: Optional[int] = Query(10, ge=1, le=200)



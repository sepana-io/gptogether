import logging
import traceback
import requests
from typing import List
from datetime import datetime
import os
from sqlalchemy import and_
from app.model import (
    GPTogetherUser,
    GPTogetherUserOnboarding,
    GPTogetherUserUpdate,
    GPTogetherConversations
)
from utility.database import SessionLocal
from utility.database_ro import SessionLocalRO
from fastapi import HTTPException, status
from utility.cryptography_utils import get_encrypting_object
from utility.conversation_utils import get_gpt_response


encrypter = get_encrypting_object()
logger = logging.getLogger(__name__)


SIMILAR_USERS_ENDPOINT_USERID = os.environ.get("SIMILAR_USERS_ENDPOINT_USERID")
SIMILAR_USERS_ENDPOINT_PROMPTS = os.environ.get("SIMILAR_USERS_ENDPOINT_PROMPTS")


def fetch_user_info_by_email(email: str, user_id:str):
    """
    Fetches user info by email address
    """
    session = None
    try:
        user_details = None
        session = SessionLocalRO()
        user_details = (
            session.query(GPTogetherUser).filter(
            and_(
                GPTogetherUser.email.ilike(email),
                GPTogetherUser.user_id == user_id
            )).one_or_none()
        )
        if not user_details:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User details not found for the Email {email}",
            )
        return user_details.to_dict()
    except HTTPException as error:
        raise error
    except Exception as error:
        error_message = traceback.format_exc()
        logger.info(f"Error while fetching user details: {error_message}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Error while fetching user details: \n error: {error}",
        )
    finally:
        session.close()


def fetch_user_info_by_user_id(user_id: str):
    """
    Fetches user info by user_id
    """
    session = None
    try:
        user_details = None
        session = SessionLocalRO()
        user_details = (
            session.query(GPTogetherUser).filter(GPTogetherUser.user_id == user_id).one_or_none()
        )
        if not user_details:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User details not found for the user id {user_id}",
            )
        return user_details.to_dict()
    except HTTPException as error:
        raise error
    except Exception as error:
        error_message = traceback.format_exc()
        logger.info(f"Error while fetching user details: {error_message}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Error while fetching user details: \n error: {error}",
        )
    finally:
        session.close()


def verify_user(openai_api_key):
    message = [
                {
                    'role': 'user',
                    'content': "hello"
                }
            ]
    _,_ = get_gpt_response(message, openai_api_key)


def onboard_user(user_info: GPTogetherUserOnboarding, user_id: str):
    """
    It allows to onboard/insert a user in the system
    """
    session = None
    try:
        encryted_key = None
        session = SessionLocal()

        if user_info.openai_api_key:
            verify_user(user_info.openai_api_key)
            encryted_key = encrypter.encrypt(str(user_info.openai_api_key).encode())
            encryted_key = encryted_key.decode()

        gptogether_user = GPTogetherUser(
            user_id=user_id,
            email=user_info.email,
            type_of_login=user_info.type_of_login,
            name=user_info.name,
            openai_api_key=encryted_key,
            twitter_handle=user_info.telegram_handle,
            discord_handle=user_info.discord_handle,
            telegram_handle=user_info.telegram_handle,
            instagram_handle=user_info.instagram_handle, 
            facebook_handle=user_info.facebook_handle,
            youtube_channel=user_info.youtube_channel,
            image_url=user_info.image_url,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            extra_metadata=user_info.extra_metadata,
            active=True,
        )
        
        session.add(gptogether_user)
        session.commit()
        user = session.query(GPTogetherUser).filter(
            GPTogetherUser.user_id == user_id).one_or_none()
        return {
            "message": f"User {user_info.email} '{user_id}' onboarded successfully!",
            "user": user.to_dict(),
        }
    except HTTPException as error:
        raise error
    except Exception as error:
        error_message = traceback.format_exc()
        logger.error(error_message)
        if "UniqueViolation" in str(error):
            logger.error(
                f"User '{user_info.email}' already exists."
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User '{user_info.email}' already exists.",
            )
        logger.info(f"Error while onboarding the user: {error_message}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error while onboarding user: \n error: {error}",
        )
    finally:
        session.close()


def update_user(user_info: GPTogetherUserUpdate, user_id:str):
    """
    Once the user is onboarded in the system, this methods allows for
    updating the user information.
    """
    session = None
    try:
        session = SessionLocal()

        if user_id != user_info.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Unauthorized operation",
            )

        gptogether_user = session.query(GPTogetherUser).get(user_info.user_id)
        if not gptogether_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with User ID {user_info.user_id} not found!",
            )
        if user_info.name:
            gptogether_user.name = user_info.name
        if user_info.image_url:
            gptogether_user.image_url = user_info.image_url
        if user_info.extra_metadata:
            gptogether_user.extra_metadata = user_info.extra_metadata
        if user_info.openai_api_key:
            verify_user(user_info.openai_api_key)
            encryted_key = encrypter.encrypt(str(user_info.openai_api_key).encode())
            encryted_key = encryted_key.decode()
            gptogether_user.openai_api_key =  encryted_key
        if user_info.twitter_handle:
            gptogether_user.twitter_handle = user_info.twitter_handle
        if user_info.discord_handle:
            gptogether_user.discord_handle = user_info.discord_handle
        if user_info.telegram_handle:
            gptogether_user.telegram_handle = user_info.telegram_handle
        if user_info.instagram_handle:
            gptogether_user.instagram_handle = user_info.instagram_handle
        if user_info.facebook_handle:
            gptogether_user.facebook_handle = user_info.facebook_handle
        if user_info.youtube_channel:
            gptogether_user.youtube_channel = user_info.youtube_channel
        
        gptogether_user.updated_at = datetime.now()
        session.add(gptogether_user)
        session.commit()

        name = ""
        if user_info.name:
            name = user_info.name
        return {
            "message": f"User {name} '{user_info.user_id}' updated successfully!"
        }
    except HTTPException as error:
        raise error
    except Exception as error:
        error_message = traceback.format_exc()
        logger.info(f"Error while updating user details: {error_message}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error while updating user details: \n error: {error}",
        )
    finally:
        session.close()


def revoke_user(user_id: str):
    """
    Deletes the user from the system
    """
    session = None
    try:
        session = SessionLocal()
        gptogether_user = session.query(GPTogetherUser).get(user_id)
        if not gptogether_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with User ID {user_id} not found!",
            )
        session.query(GPTogetherConversations).filter(
            GPTogetherConversations.user_id == user_id
        ).delete()
        session.flush()
        session.delete(gptogether_user)
        session.commit()
        return {"message": f"User {user_id} revoked successfully!"}
    except HTTPException as error:
        raise error
    except Exception as error:
        error_message = traceback.format_exc()
        logger.info(f"Error while deleting user details: {error_message}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error while deleting user details: \n error: {error}",
        )
    finally:
        session.close()


def fetch_users_info_by_userids(user_ids: List[str]):
    """
    Fetches user info by user_ids
    """
    session = None
    try:
        session = SessionLocalRO()
        if not user_ids or not isinstance(user_ids, list):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User IDs not provided {user_ids}",
            )

        if len(user_ids) > 20:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A maximum of 20 user ids can be used, provided {len(user_ids)}",
            )

        user_details = (
            session.query(GPTogetherUser).filter(GPTogetherUser.user_id.in_(user_ids)).all()
        )
        if not user_details:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User details not found!",
            )
        users_info_schema = {}
        for user in user_details:
            users_info_schema[user.user_id] = user.to_dict()
        return users_info_schema
    except HTTPException as error:
        raise error
    except Exception as error:
        error_message = traceback.format_exc()
        logger.info(f"Error while fetching user details: {error_message}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Error while fetching user details: \n error: {error}",
        )
    finally:
        session.close()


def find_similar_users(user_id: str, prompts=[]):
    similar_users = []
    try:
        if not user_id:
            raise HTTPException(detail="user_id can not be empty", status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)
        
        endpoint = SIMILAR_USERS_ENDPOINT_USERID
        json_data = {}
        json_data['user_id_external'] = user_id
        if prompts:
            json_data = {}
            json_data['prompts'] = prompts
            endpoint = SIMILAR_USERS_ENDPOINT_PROMPTS
        
        response = requests.post(endpoint, json=json_data)

        user_ids = []
        
        if response.status_code == 200:
            for user in response.json().get("rows"):
                user['user_id'] = user.get("user_id_external") if user.get("user_id_external") else user.get("user_name")
                user_ids.append(user['user_id'])
                similar_users.append(user)
        
        return similar_users
    except HTTPException as herr:
        raise herr
    except Exception as err:
        raise HTTPException(
            detail=f"Issues while fetching similar users {err}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
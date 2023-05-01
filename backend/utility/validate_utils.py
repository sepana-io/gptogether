import logging
from fastapi import status, HTTPException, Header
from firebase_admin import auth
from utility.firebase_utils import get_firebase_connection

get_firebase_connection()


logger = logging.getLogger(__name__)


def validate_user(authorization: str = Header(None)):
    if authorization is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Authorization header not provided")
    try:
        auth_token = authorization.split("Bearer ")[1]
        decoded_token = auth.verify_id_token(auth_token)
        user_id = decoded_token["uid"]
        return user_id
    except Exception as err:
        logger.error(f"Error while authenticating: {err}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid authorization token")
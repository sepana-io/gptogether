import logging
from utility.database_ro import SessionLocalRO
from app.model import (
    GPTogetherUser
)
from utility.cryptography_utils import get_encrypting_object
from fastapi import HTTPException, status

decrypter = get_encrypting_object()


logger = logging.getLogger(__name__)


def decrypt_key(key, user_id):
    session = SessionLocalRO()
    try:
        user_key = session.query(GPTogetherUser).filter(
            GPTogetherUser.user_id == user_id,
            GPTogetherUser.key == key
        ).one_or_none()
        if not user_key:
            raise HTTPException(
                detail="Unauthorized access to the API key",
                status_code=status.HTTP_403_FORBIDDEN
            )
        decryter_val = decrypter.decrypt(key.encode())
        return {
            "key": decryter_val.decode()
        }
    except HTTPException as herr:
        raise herr
    except Exception as err:
        raise HTTPException(
            detail=f"Error while decrypting the key {err}",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
        )
    finally:
        session.close()

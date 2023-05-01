import os
from cryptography.fernet import Fernet

ENCRYPTING_KEY = str(os.environ.get("ENCRYPTING_KEY"))


def get_encrypting_object():
    return Fernet(ENCRYPTING_KEY)
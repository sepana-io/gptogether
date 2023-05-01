import json
import logging
import os
import firebase_admin
from firebase_admin import credentials


logger = logging.getLogger(__name__)


authentication_file = "firebase-admin-key.json"

key_path = os.environ.get("FIREBASE_KEY_PATH")

if key_path:
    key_path = os.path.join(key_path, "firebase-key.json")
else:
    key_path = "firebase-key.json"


def get_firebase_connection():
    if not os.path.exists(authentication_file):
        with open(key_path, 'r') as sa_file:
            data = json.load(sa_file)
        with open(authentication_file, 'w') as wsa_file:
            json.dump(data, wsa_file, indent=4)
    cred = credentials.Certificate(authentication_file)
    firebase = firebase_admin.initialize_app(cred)
    return firebase


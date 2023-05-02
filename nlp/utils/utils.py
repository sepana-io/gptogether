import os
import requests
from os import getenv, system
from os.path import isfile, isdir
from typing import Union
import pickle
from hashlib import md5


def load_env_var(var_key: str) -> str:
    if not (value := getenv(var_key)):
        from dotenv import load_dotenv
        load_dotenv()
        value = getenv(var_key)
    return value


CONV_ENDPOINT = load_env_var('CONV_ENDPOINT')
CONVS_ENDPOINT = load_env_var('CONVS_ENDPOINT')

PUSH_TOKEN, PUSH_USER = load_env_var('PUSH_TOKEN'), load_env_var('PUSH_USER')
ssh_hostname = load_env_var('SSH_HOSTNAME')
ssh_username = load_env_var('SSH_USERNAME')
ssh_password = load_env_var('SSH_PASSWORD')
DEV, APP_ENV, SMALL, LARGE = 'dev', load_env_var('APP_ENV'), 'small', 'large'
FILES, IS_DEV = 'files', DEV == APP_ENV
MODE = SMALL if APP_ENV == DEV else LARGE


def bash(command: str):
    system(command)


def fread(path='/1.txt') -> list:
    with open(path) as f:
        lines = f.readlines()

    return lines


def download_file_ftp(file: str, download_dir: str = './files'):
    cmd = f'cd {download_dir}; wget ftp://{ssh_username}:{ssh_password}@{ssh_hostname}/{file}'
    bash(cmd)


def exist(path: str) -> bool:
    return isfile(path) or isdir(path)


def pickle_it(path: str, obj: object):
    with open(path, 'wb') as file:
        pickle.dump(obj, file)


def unpickle_it(path: str) -> Union[object, dict]:
    if not os.path.exists(path):
        return None
    with open(path, 'rb') as file:
        return pickle.load(file)


def get_hash(text: str) -> str:
    """
    Checksum AKA md5 hash
    @param text:
    @return:
    """
    if text is None:
        text = ''

    return md5(text.encode("utf-8")).hexdigest()


def get_conversation(conv_id: str) -> dict:
    headers = {
        'Content-Type': 'application/json',
    }

    json_data = {
        "document_id": conv_id
    }

    response = requests.post(CONV_ENDPOINT, headers=headers, json=json_data)

    return response.json()


def get_conversations(conv_ids: list[str]) -> dict:
    headers = {
        'Content-Type': 'application/json',
    }

    json_data = {
        "document_ids": conv_ids
    }

    response = requests.post(CONVS_ENDPOINT, headers=headers, json=json_data)

    return response.json()


def push(title='', message=''):
    url = "https://api.pushover.net/1/messages.json"
    params = {
        'token': PUSH_TOKEN,
        'user': PUSH_USER,
        'title': title,
        'message': message
    }

    r = requests.post(url=url, params=params)
    r = r.json()

    return r

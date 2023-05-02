#!/bin/bash
sudo apt update
# apt install python-dev libmysqlclient-dev
sudo apt install python3.11-dev default-libmysqlclient-dev build-essential

python3.11 -m venv venv3
~/.pyenv/versions/3.11.1/bin/python3.11 -m venv venv

source ./venv/bin/activate
pip3 install --upgrade pip
python -V; pip -V

pip install -r requirements.txt

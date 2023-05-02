import sys, os
INTERP = "/home/playground/playground_flask/venv/bin/python"
#INTERP is present twice so that the new Python interpreter knows the actual executable path
if sys.executable != INTERP: os.execl(INTERP, INTERP, *sys.argv)
from app import app as application

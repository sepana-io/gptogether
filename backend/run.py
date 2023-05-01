import logging
from app import get_application
from app.formatter import ElkJsonFormatter

jsonhandler = logging.StreamHandler()
jsonhandler.setFormatter(ElkJsonFormatter())
root_logger = logging.getLogger()
root_logger.addHandler(jsonhandler)
root_logger.setLevel(logging.INFO)

app = get_application()

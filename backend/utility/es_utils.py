from elasticsearch import Elasticsearch
import os
from elasticsearch.connection.http_urllib3 import create_ssl_context
import ssl

CONFIG_MODE = os.environ.get("CONFIG_MODE", "Development")
ELASTICSEARCH_HOST = f"{os.environ.get('ES_HTTP_SERVICE_HOST','localhost')}:{int(os.environ.get('ES_HTTP_SERVICE_PORT',9200))}"
ES_ADMIN_API_KEY = os.environ.get("ES_ADMIN_API_KEY")
ES_ADMIN_API_ID = os.environ.get("ES_ADMIN_API_ID")


class ElasticClient(Elasticsearch):
    def init_app(self):
        hosts = [ELASTICSEARCH_HOST]
        context = create_ssl_context(cadata=os.environ.get("ES_CA"))
        context.check_hostname = False
        context.verify_mode = (
            ssl.CERT_REQUIRED if CONFIG_MODE == "Production" else ssl.CERT_NONE
        )
        context.verify_mode = ssl.CERT_NONE
        super().__init__(
            hosts=hosts,
            api_key=(ES_ADMIN_API_ID, ES_ADMIN_API_KEY),
            ssl_context=context,
            scheme="https",
            timeout=360,
        )


es = ElasticClient()

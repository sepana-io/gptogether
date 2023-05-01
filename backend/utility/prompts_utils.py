import logging
import requests
import os
from utility.lru import lru_with_ttl


logger = logging.getLogger(__name__)


AUTO_SUGGESTION_ENDPOINT = os.environ.get("AUTO_SUGGESTION_ENDPOINT")


@lru_with_ttl(ttl_seconds=30)
def auto_complete_prompts(query, top_n, max_words):
    json_data = {
        'query': query,
        'top_n': top_n,
        'max_words': max_words
    }
    suggests = []
    try:
        response = requests.post(AUTO_SUGGESTION_ENDPOINT, json=json_data)
        if response.status_code == 200:
            response_rows = response.json().get("rows")
            for row in response_rows:
                if row.get("text2") and row.get("score")>0.55:
                    suggests.append(row.get("text2"))
    except Exception as err:
        logger.error(f"Error while fetching autocomplete suggestions {err}")
    return suggests

import logging
import uuid
import math
import requests
import os
import openai
from datetime import datetime
from fastapi import HTTPException, status
from typing import List
from app.model import (
    GPTogetherConversationsIngest, 
    GPTogetherConversations,
    GPTogetherUser,
    GPTogetherVisibilityOptions,
    GPTogetherConversationsUpdate,
    GPTogetherShareState
)
from utility.utils import (
    decrypt_key
)
from sqlalchemy import and_, func, text, desc, or_
from utility.database import SessionLocal
from utility.database_ro import SessionLocalRO
from utility.es_utils import es

es_client = es.init_app()


logger = logging.getLogger(__name__)

INDEX_NAME = os.environ.get("ES_INDEX_NAME", "gptogether_store") 


def get_gpt_response(history:List, api_key:str):
    try:
        openai.api_key = api_key
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo", 
            messages=history,
            max_tokens=200
        )
        response_content = response.choices[0].message.content
        history.append({
            "role": "assistant",
            "content": response_content
        })
        return history, response_content
    except Exception as err:
        raise HTTPException(
            detail=f"Issues while fetching OpenAI response {err}",
            status_code=status.HTTP_424_FAILED_DEPENDENCY
        )


def persist_conversation_in_es(document_id, document={}):
    try:
        es.index(index=INDEX_NAME, id=document_id, body=document)
        return True
    except Exception as err:
        raise HTTPException(
            detail=f"Couldn't persist conversation in ES {err}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def create_conversation(
        conversation_meta:  GPTogetherConversationsIngest,
        user_id: str):
    session = None
    try:
        session = SessionLocal()

        if not conversation_meta.message:
            raise HTTPException(
                detail="Prompt text can not be empty",
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
            )

        db_data = session.query(GPTogetherUser.openai_api_key).filter(
            GPTogetherUser.user_id == user_id
        ).one_or_none()
        openai_api_key = db_data.openai_api_key
        openai_api_key = decrypt_key(openai_api_key).get('key')
        message = [
            {
                'role': 'user',
                'content': conversation_meta.message
            }
        ]

        history, response_content = get_gpt_response(message, str(openai_api_key))
        conversation_id = str(uuid.uuid4())
        document_id = f"{conversation_id}_{user_id}"

        conversation_meta = GPTogetherConversations(
            conversation_id = conversation_id,
            user_id = user_id,
            title_prompt = conversation_meta.title_prompt,
            storage_index = document_id,
            total_prompts = 1,
            total_state_shares = 0,
            visibility_setting = conversation_meta.visibility_setting,
            created_at = datetime.now(),
            updated_at = datetime.now()
        )

        document = {
            "conversation_id": conversation_id,
            "user_id": user_id,
            "message_history": history,
            "history": history,
            "title_prompt": conversation_meta.title_prompt,
            "visibility_setting": conversation_meta.visibility_setting,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }

        if persist_conversation_in_es(document_id=document_id, document=document):
            session.add(conversation_meta)
            session.commit()
        
        return {
            "response": response_content,
            "conversation": document
        }    

    except HTTPException as h_err:
        raise h_err
    except Exception as err:
        logger.error(f"Issues while creating the conversation {err}")
        raise HTTPException(
            detail=f"Issues while creating the conversation {err}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    finally:
        session.close()


def list_conversations(
    user_id: str, 
    page_num = 1,
    sort_by = "updated_at"
):
    session = None
    rows_per_page = 20
    try:
        session = SessionLocalRO()
        conversations_meta = {}
        condition = or_(
            GPTogetherConversations.user_id == user_id,
        )
        total_entries = session.query(
            func.count(GPTogetherConversations.conversation_id)
        ).filter(condition).scalar()
        
        conversations = []
        if sort_by == 'updated_at':
            conversations = session.query(
                GPTogetherConversations
            ).order_by(desc(text(sort_by))
            ).filter(condition
            ).offset(
                (page_num-1)* rows_per_page
            ).limit(rows_per_page).all()
        else:
            conversations = session.query(
                GPTogetherConversations
            ).order_by(text(sort_by)
            ).filter(condition
            ).offset(
                (page_num-1)* rows_per_page
            ).limit(rows_per_page).all()
        
        conversations_meta['conversations'] = conversations
        conversations_meta['total'] = total_entries
        conversations_meta['page'] = page_num
        return conversations_meta
    except Exception as e:
        logger.exception(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not fetch conversations, error: {e}",
        )
    finally:
        session.close()


def fetch_es_data_for_single_id(
        document_id, 
        visibility_setting=GPTogetherVisibilityOptions.history_exposed
    ):
    try:
        doc = es.get(index=INDEX_NAME, id=document_id, _source=['history','message_history', 'previous_visibility'])
        message_history = doc.get("_source", {}).get("message_history", [])
        history = doc.get("_source", {}).get("history", [])

        previous_visibility = doc.get("_source", {}).get("previous_visibility", None)
        total_conversations =  math.ceil(len(history)/2)

        if not message_history and history:
            return [], previous_visibility, total_conversations
            
        if visibility_setting == GPTogetherVisibilityOptions.history_exposed:
            return message_history, previous_visibility, total_conversations
        else:
            return [], previous_visibility, total_conversations
    except Exception as err:
        raise HTTPException(
            detail=f"Couldn't fetch message history for a conversation {err}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def fetch_complete_es_conversation(
        document_id,
        provide_message_history=False
    ):
    try:
        doc = es.get(index=INDEX_NAME, id=document_id, _source=['history', 'message_history', 'state'])
        message_history = doc.get("_source", {}).get("message_history", [])
        history = doc.get("_source", {}).get("history", [])
        if not provide_message_history:
            return history
        return history, message_history
    except Exception as err:
        raise HTTPException(
            detail=f"Couldn't fetch message history for a conversation {err}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def fetch_conversation_by_id(conversation_id: str, 
        user_id: str):
    session = None
    try:
        session = SessionLocalRO()
        conversation_meta = session.query(GPTogetherConversations).filter(
            GPTogetherConversations.user_id == user_id,
            GPTogetherConversations.conversation_id == conversation_id
        ).one_or_none()

        if not conversation_meta:
            raise HTTPException(
                detail="Conversation not available or forbidden",
                status_code=status.HTTP_403_FORBIDDEN
            )
        conversation_meta = conversation_meta.to_dict()
        document_id = conversation_meta['storage_index']


        (message_history, 
         previous_visibility, 
         total_conversations) = fetch_es_data_for_single_id(
            document_id
        )

        conversation_meta['message_history'] = message_history
        conversation_meta['previous_visibility'] = previous_visibility
        conversation_meta['total_conversations'] = total_conversations
        return conversation_meta
    except HTTPException as herr:
        raise herr
    except Exception as err:
        raise HTTPException(
            detail=f"Unable to fetch conversation by id {conversation_id}: {err}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    finally:
        session.close()


def fetch_conversation_by_did(document_id: str, 
        user_id: str):
    session = None
    try:
        session = SessionLocalRO()
        conversation_meta = session.query(GPTogetherConversations).filter(
            GPTogetherConversations.visibility_setting != GPTogetherVisibilityOptions.private,
            GPTogetherConversations.storage_index == document_id
        ).one_or_none()


        if not conversation_meta:
            raise HTTPException(
                detail="Conversation is not publicly shared",
                status_code=status.HTTP_403_FORBIDDEN
            )
        conversation_meta = conversation_meta.to_dict()

        (message_history, 
         previous_visibility, 
         total_conversations) = fetch_es_data_for_single_id(
            document_id, 
            conversation_meta.get("visibility_setting")
        )

        conversation_meta['message_history'] = message_history
        conversation_meta['previous_visibility'] = previous_visibility
        conversation_meta['total_conversations'] = total_conversations
        return conversation_meta
    except HTTPException as herr:
        raise herr
    except Exception as err:
        raise HTTPException(
            detail=f"Unable to fetch conversation by document id {document_id}: {err}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    finally:
        session.close()


def delete_es_data_by_id(document_id):
    try:
        es.delete(index=INDEX_NAME, id=document_id, ignore=404)
        return True
    except Exception as err:
        raise HTTPException(
            detail=f"Error while delete data from ES: {err}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def delete_conversation(conversation_id: str, user_id:str):
    session = None
    try:
        session = SessionLocal()
        conversation_meta = session.query(GPTogetherConversations).filter(
            and_(
            GPTogetherConversations.user_id == user_id,
            GPTogetherConversations.conversation_id == conversation_id
        ))
        conversation = conversation_meta.one_or_none()
        if not conversation:
            raise HTTPException(
                detail=f"Matching conversation not found {conversation_id}",
                status_code=status.HTTP_404_NOT_FOUND
            )
        document_id = conversation.storage_index
        if delete_es_data_by_id(document_id):
            conversation_meta.delete()
            session.commit()
        return {
            "message": f"conversation {conversation_id} deleted successfully"
        }
    except HTTPException as herr:
        raise herr
    except Exception as err:
        raise HTTPException(
            detail=f"Unable to delete the conversation {conversation_id}: {err}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    finally:
        session.close()


def list_others_conversations(
    user_id: str, 
    others_user_id: str,
    page_num = 1,
    sort_by = "updated_at"
):
    session = None
    rows_per_page = 20
    try:
        session = SessionLocalRO()
        conversations_meta = {}
        condition = and_(
            GPTogetherConversations.user_id == others_user_id,
            GPTogetherConversations.visibility_setting != GPTogetherVisibilityOptions.private
        )
        total_entries = session.query(
            func.count(GPTogetherConversations.conversation_id)
        ).filter(condition).scalar()
        
        conversations = []
        if sort_by == 'updated_at':
            conversations = session.query(
                GPTogetherConversations
            ).order_by(desc(text(sort_by))
            ).filter(condition
            ).offset(
                (page_num-1)* rows_per_page
            ).limit(rows_per_page).all()
        else:
            conversations = session.query(
                GPTogetherConversations
            ).order_by(text(sort_by)
            ).filter(condition
            ).offset(
                (page_num-1)* rows_per_page
            ).limit(rows_per_page).all()
        
        conversations_meta['conversations'] = conversations
        conversations_meta['total'] = total_entries
        conversations_meta['page'] = page_num
        return conversations_meta
    except Exception as e:
        logger.exception(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not fetch conversations, error: {e}",
        )
    finally:
        session.close()


def update_conversation_in_es(document_id, message_history=[], history=[]):
    try:
        update_body = {
            "doc": {
                "message_history": message_history,
                "history": history
            }
        }
        es.update(index=INDEX_NAME, id=document_id, body=update_body)
        return True
    except Exception as err:
        raise HTTPException(
                detail=f"Unable to persist new response in ES {err}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    

def update_conversation(
        conversation_meta:  GPTogetherConversationsUpdate,
        user_id: str
):
    session = None
    try:
        session = SessionLocal()
        conversation_id = conversation_meta.conversation_id

        if not conversation_id:
            raise HTTPException(
                detail="Conversation ID can not be empty",
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
            )
        update_schema = {}
        
        if conversation_meta.additional_metadata:
            update_schema['additional_metadata'] = conversation_meta.additional_metadata
        if conversation_meta.visibility_setting:
            update_schema['visibility_setting'] = conversation_meta.visibility_setting
        if conversation_meta.title_prompt:
            update_schema['title_prompt'] = conversation_meta.title_prompt
        update_schema['updated_at'] = datetime.now()
        
        conversation_db = session.query(
            GPTogetherConversations).filter(and_(
            GPTogetherConversations.user_id == user_id,
            GPTogetherConversations.conversation_id == conversation_id
            ))
    
        user_db = session.query(GPTogetherUser.openai_api_key).filter(
            GPTogetherUser.user_id == user_id
        ).one_or_none()
    
        data = conversation_db.one_or_none()

        if not data:
            raise HTTPException(
                detail="Conversation not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        if not conversation_meta.message:
            conversation_db.update(update_schema)
            session.commit()
            return {
                "details": "conversation updated successfully",
                "response": "",
            }
        
        update_schema['total_prompts'] = data.total_prompts + 1

        history, message_history = fetch_complete_es_conversation(
            document_id=data.storage_index, 
            provide_message_history=True
        )

        user_message = {
            "role": "user",
            "content": conversation_meta.message
        }

        message_history.append(user_message)
        history.append(user_message)
        api_key = decrypt_key(user_db.openai_api_key, user_id).get("key")

        history, response_content = get_gpt_response(history, str(api_key))
        message_history.append({
            "role": "assistant",
            "content": response_content
        })

        if update_conversation_in_es(data.storage_index, message_history, history):
            conversation_db.update(update_schema)
            session.commit()
            return {
                "details": "conversation updated successfully",
                "message_history": message_history,
                "response": response_content,
            }
    except HTTPException as herr:
        raise herr
    except Exception as err:
        raise HTTPException(
            detail=f"Could not update the conversation {err}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    finally:
        session.close()


def share_conversation_state(share_state: GPTogetherShareState, user_id: str):
    session = None
    try:
        session = SessionLocal()

        referenced_document_id = share_state.document_id
        if not referenced_document_id:
            raise HTTPException(
                detail=f"Document ID not provided",
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
            ) 
        conversation_meta_obj = session.query(GPTogetherConversations).filter(
            and_(
                GPTogetherConversations.storage_index == referenced_document_id,
                GPTogetherConversations.visibility_setting != GPTogetherVisibilityOptions.private
            )
        ).one_or_none()
        if not conversation_meta_obj:
            raise HTTPException(
                detail=f"Conversation is either not available or doesn't allow sharing",
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
            )
        conversation_id = str(uuid.uuid4())
        document_id = f"{conversation_id}_{user_id}"
        
        conversation_meta = GPTogetherConversations(
            conversation_id = conversation_id,
            user_id = user_id,
            title_prompt = conversation_meta_obj.title_prompt,
            storage_index = document_id,
            total_prompts = conversation_meta_obj.total_prompts,
            total_state_shares = 0,
            visibility_setting = share_state.visibility_setting,
            created_at = datetime.now(),
            updated_at = datetime.now()
        )
        
        document = conversation_meta.to_dict()

        document['referenced_conversation'] = referenced_document_id
        document['previous_visibility'] = conversation_meta_obj.visibility_setting

        (message_history,
         history) = fetch_complete_es_conversation(referenced_document_id, True)
        

        document['history'] = history
        if conversation_meta_obj.visibility_setting == GPTogetherVisibilityOptions.history_exposed:
            document['message_history'] = message_history
        else:
            document['message_history'] = []

        if persist_conversation_in_es(document_id=document_id, document=document):
            session.add(conversation_meta)
            session.commit()
        
        document.pop('history')
        return {
            "conversation": document
        }    
        
    except HTTPException as herr:
        raise herr
    except Exception as err:
        raise HTTPException(
            detail=f"Issues while sharing system state {err}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )  
    finally:
        session.close()


def fetch_similar_conversations(conversation_id: str, user_id: str, prompts=[]):
    similar_conversations = []
    try:
        if not conversation_id and not prompts:
            raise HTTPException(detail="Both conversation ID and prompts can not be empty", status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)
        
        endpoint = "https://playground.adcore.com/api/similar_conversations"
        json_data = {}
        json_data['storage_index'] = f"{conversation_id}_{user_id}"
        if prompts:
            json_data = {}
            json_data['prompts'] = prompts
            endpoint = "https://playground.adcore.com/api/similar_conversations_by_prompts"
        
        response = requests.post(endpoint, json=json_data)
        
        if response.status_code == 200:
            for conversation in response.json().get("rows"):
                if conversation['score'] > 0.5:
                    similar_conversations.append(conversation)

        return similar_conversations
    except HTTPException as herr:
        raise herr
    except Exception as err:
        raise HTTPException(
            detail=f"Issues while fetching similar conversations {err}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    

def fetch_multiple_es_documents(document_ids=[]):
    docs = []
    try:
        query = {
            "query": {
                "terms": {"_id": document_ids}
            },
            "size": 1000,
            "_source": ["history"] 
        }

        results = es.search(index=INDEX_NAME, body=query)

        results = results["hits"]["hits"]
        response = {}
        for elm in results:
            response[elm['_id']] = elm['_source']['history']

        return response
    except Exception as err:
        logger.error(err)
        return docs

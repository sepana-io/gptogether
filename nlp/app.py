from datetime import datetime
import os
import re
import traceback
import logging
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from urllib.parse import unquote
from werkzeug.datastructures import ImmutableMultiDict
from Api import Api
from User import np, sample
from UserBase import sleep, SLEEP_MIN, SLEEP_MAX, uniform, COLUMN_USER_ID_EXTERNAL  # user_id_external
from utils.utils import push, IS_DEV, load_env_var

from dotenv import load_dotenv
load_dotenv()

api = Api()
if not IS_DEV:
    push('nlp initial app load...', 'nlp initial app load...')
sync_all_lock = False  # used to guarantee only one call happens at a time
PUSH_HOUR, PUSH_MINUTE = 10, 55

r_newline = re.compile(r'(?:\r?\n)+')

log = logging.getLogger('werkzeug')
log.setLevel(logging.INFO)

local_port = int(load_env_var('LOCAL_PORT'))

flask_server_config = {

    'host': '0.0.0.0',
    'port': int(os.getenv('PORT', local_port)),
    # 'debug': False,
    'debug': True,
    'threaded': True
}

app = Flask(__name__)
app.secret_key = os.urandom(12)
CORS(app)

POST = 'POST'


@app.route('/files/<path:path>')
def files(path):
    """
    An old route for js scripts
    @param path:
    @return:
    """
    return send_from_directory('files', path)


def params_json() -> dict:
    params = request.get_json() if request is not None else None
    if not params:
        params = request.form.to_dict()
    if not params:
        params = request.args
        if params:
            params = params.to_dict()

    return params


@app.route('/sync/all', methods=('GET', POST))
def sync_all():
    """
    syncs users, prompts and conversations from the real data with the demo memory data
    :return:
    """
    global sync_all_lock
    status_code = 200
    now = datetime.now()
    try:
        # TEST
        # if 1 < len('abc'):
        #     raise Exception('fudge these teacups')

        if not sync_all_lock:
            sleep(uniform(SLEEP_MIN, SLEEP_MAX))
            if not sync_all_lock:  # old double lock technique
                sync_all_lock = True
                api.sync_blank_users_prompts()
                api.sync_users_n_prompts()
                api.sync_convs()
                result = {'status': f'OK, ran sync_blank_users_prompts, sync_users_n_prompts, sync_convs, {now}'}
                sync_all_lock = False

                h, m = (int(o) for o in now.strftime('%H:%M').split(':'))
                if all((h == PUSH_HOUR, m == PUSH_MINUTE)):
                    push(f'successful sync_all call at: {h}: {m}', f'successful sync_all call at: {h}: {m}')
            else:
                status_code = 500
                result = {'error': f'another sync in progress... {now}'}
        else:
            status_code = 500
            result = {'error': 'another sync in progress... {now}'}
    except:
        status_code = 500
        err: str = traceback.format_exc()
        result = {'error': f'{str(now)} ' + err}
        push(f'sync_all error', f'sync_all error: {err[-50:]}')
        sync_all_lock = False

    response = jsonify(result)
    response.status_code = status_code
    return response


@app.route('/api', methods=('GET', POST))
def api_call():
    status_code = 200
    params = params_json()
    if params is None:
        result = {'error': 'no command'}
        status_code = 404
    else:
        params['query'] = unquote(params.get('query'))
        result = api.get_top_n_search_results(**params)

    response = jsonify(result)
    response.status_code = status_code
    return response


@app.route('/api/prompts_users', methods=('GET', POST))
def api_prompts_users():
    status_code = 200
    params = params_json()
    if params is None:
        result = {'error': 'no command'}
        status_code = 404
    else:
        prompts = [unquote(o) for o in params.get('prompts')]
        result = api.get_similar_user_entries_for_prompts(prompts)
        result = {'rows': result}

    response = jsonify(result)
    response.status_code = status_code
    return response


@app.route('/prompts_users', methods=('GET', POST))
def prompts_users():

    if request.method == POST:
        params: dict = get_form_params(request.form)
        prompts = r_newline.split(params.get('query').strip())
        results = api.get_similar_user_entries_for_prompts(prompts, top_n=params.get('top_n'))
        params.update({'rows': results})
        return render_template('prompts_users.html', **params)

    # user_ids = np.unique(api.labels).shape[0]
    user_ids = np.unique(api.labels_aka_user_ids).shape[0]
    rand_user_ids: list = sample(range(user_ids), 1)
    query = '\n'.join(api.get_sample_prompts_for_user(rand_user_ids[0], add_dots=0))
    params = {'query': query}
    return render_template('prompts_users.html', **params)


@app.route('/api/users', methods=('GET', POST))
def api_users():
    status_code = 200
    params = params_json()
    if params is None:
        result = {'error': 'no command'}
        status_code = 404
    else:
        if (u_id := api.get_user_id_by_user_id_external(params.get(COLUMN_USER_ID_EXTERNAL))) > -1:
            params['user_id'] = u_id
            del params[COLUMN_USER_ID_EXTERNAL]
        result = api.get_similar_user_entries(**params)
        result = {'rows': result, 'user': api.get_users_entries([params.get('user_id')])[0]}

    response = jsonify(result)
    response.status_code = status_code
    return response


@app.route('/users', methods=('GET', POST))
def users():
    if request.method == POST:
        params: dict = get_form_params_user(request.form)
        results = api.get_similar_user_entries(**params)
        params.update({'rows': results})
        params.update({'rand_users': api.get_random_users(user_id=params.get('user_id'))})
        params.update({'user': api.get_users_entries([params.get('user_id')])[0]})
        return render_template('users.html', **params)

    params = {'rand_users': api.get_random_users(), 'user_id': -1}
    return render_template('users.html', **params)


@app.route('/api/similar_conversations', methods=('GET', POST))
def similar_conversations():
    status_code = 200
    params = params_json()
    if params is None:
        result = {'error': 'no command'}
        status_code = 404
    else:

        result = api.get_similar_conversations(**params)  # @storage_index: str expected
        result = {'rows': result}

    response = jsonify(result)
    response.status_code = status_code
    return response


@app.route('/api/similar_conversations_by_prompts', methods=('GET', POST))
def similar_conversations_by_prompts():
    status_code = 200
    params = params_json()
    if params is None:
        result = {'error': 'no command'}
        status_code = 404
    else:

        result = api.get_similar_conversations_by_prompts(**params)  # @prompts: list[str] expected
        result = {'rows': result}

    response = jsonify(result)
    response.status_code = status_code
    return response


@app.route('/', methods=('GET', POST))
def index():

    if request.method == POST:
        params: dict = get_form_params(request.form)
        search_results = api.get_top_n_search_results(**params)
        params.update(search_results)
        return render_template('index.html', **params)

    return render_template('index.html')


def get_form_params_user(req: ImmutableMultiDict) -> dict:
    ret = {
        'user_id': int(req.get('user_id', 0))
    }
    return ret


def get_form_params(req: ImmutableMultiDict) -> dict:
    ret = {
        'query': unquote(req.get('query', '')),
        'top_n': int(req.get('engine_id', 10))
    }
    return ret


if __name__ == '__main__':
    app.run(host=flask_server_config['host'], port=flask_server_config['port'], debug=flask_server_config['debug'],
            threaded=flask_server_config['threaded'])

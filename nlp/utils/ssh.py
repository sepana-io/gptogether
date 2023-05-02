import paramiko
from utils.utils import load_env_var

n_bytes = 4096
hostname = load_env_var('SSH_HOSTNAME')
port = int(load_env_var('SSH_PORT'))
username = load_env_var('SSH_USERNAME')
password = load_env_var('SSH_PASSWORD')
username_root = load_env_var('SSH_USERNAME_ROOT')
password_root = load_env_var('SSH_PASSWORD_ROOT')


def ssh_call(command: str = 'ls', root=0, host=None):
    """
    cd public_html; python 3rd/tusc/save_images2.py
    :param command:
    :param root:
    :param host:
    :return:
    """

    if not host:
        host = hostname

    client = paramiko.Transport((host, port))

    if not root:
        client.connect(username=username, password=password)
    else:
        client.connect(username=username_root, password=password_root)

    stdout_data = []
    stderr_data = []
    session = client.open_channel(kind='session')
    session.exec_command(command)
    while True:
        if session.recv_ready():
            stdout_data.append(session.recv(n_bytes).decode("utf-8", "ignore"))
        if session.recv_stderr_ready():
            stderr_data.append(session.recv_stderr(n_bytes).decode("utf-8", "ignore"))
        if session.exit_status_ready():
            break

    ret__exit_status = session.recv_exit_status()

    print('exit status: ', ret__exit_status)
    print(''.join(stdout_data))
    print(''.join(stderr_data))

    session.close()
    client.close()

    return ret__exit_status

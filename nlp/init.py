from utils.utils import exist, IS_DEV, FILES, bash, download_file_ftp
from utils.ssh import ssh_call
from vec_serialize_np_arr import do as vec_serialize__do

VEC_DIR = 'vectors_small' if IS_DEV else 'vectors'
_dir = f'{FILES}/{VEC_DIR}'

"""
# 11-04-2023 11:12 - this script does all the heavy lifting needed for vector initialization
cd playground_flask
source venv/bin/activate

mkdir files/vectors

# create a tar.gz via ssh on hosting.xyz
python
from utils.ssh import ssh_call
cmd = 'cd vectors; tar -zcvf vecs.npy.tar.gz vec_*.npy'  ! LARGE - 2.4GB
ssh_call(cmd)

# Download the tar.gz
cd files/vectors
wget ftp://hosting.xyz/vectors/vecs.npy.tar.gz
tar -zxvf vecs.npy.tar.gz
rm vecs.npy.tar.gz
this will create one large .npy file, namely: np_arr.npy and will delete the rest
python vec_serialize_np_arr.py
"""

if not exist(_dir):
    print(f'creating blank directory; {_dir}')
    bash(f'mkdir {_dir}')
else:
    raise Exception(f'{_dir} exists')

cmd = f'cd {VEC_DIR}; [ -e "vecs.npy.tar.gz" ] || tar -zcvf vecs.npy.tar.gz vec_*.npy'
print(f'executing ssh call on remote server where the vector chunks are stored... {cmd}')
ssh_call(cmd)

file_download = f'{VEC_DIR}/vecs.npy.tar.gz'
print(f'downloading... {file_download}')
download_file_ftp(file_download, _dir)

cmd = f'cd {_dir}'
cmd += f'; tar -zxvf vecs.npy.tar.gz'
cmd += '; rm vecs.npy.tar.gz'

print(f'executing locally extract and inflate tar.gz archive, cleanup... {cmd}')
bash(cmd)

print('executing: joins all vector ordered chunks into a single large one and persists in on disk ')
vec_serialize__do()

print('DONE')

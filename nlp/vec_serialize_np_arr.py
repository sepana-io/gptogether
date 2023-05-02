import re
import numpy as np
from pathlib import Path
from utils.utils import IS_DEV, FILES, bash


VEC_DIR = 'vectors_small' if IS_DEV else 'vectors'
r_chunk = re.compile(r'(?<=_)\d+')
_dir = f'{FILES}/{VEC_DIR}'


def do():
    """
    joins all vector ordered chunks into a single large one and persists in on disk
    cleans up the chunk part
    :return:
    """
    ls = sorted([o.name for o in Path(_dir).rglob('*.npy')], key=lambda x: int(r_chunk.search(x)[0]))
    print(f'confirming order of chunks: [{ls[:5]} ... {ls[-5:]}]')
    np_arr: np.array = None
    for i, file in enumerate(ls):
        if i and not i % 50:
            print(f'adding to memory chunk No: {i}')
        _np_arr = np.load(f'{_dir}/{file}')
        np_arr = np.vstack((np_arr, _np_arr)) if np_arr is not None else _np_arr
    print(f'saving large single file {_dir}/np_arr.npy')
    np.save(f'{_dir}/np_arr.npy', np_arr)
    print(f'cleaning up chunk files {_dir}/vec_*.npy')
    bash(f'rm {_dir}/vec_*.npy')


if __name__ == '__main__':
    do()

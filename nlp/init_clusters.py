import numpy as np
import pandas as pd
from fast_pytorch_kmeans import KMeans
from torch import cuda
import torch
from sklearn.cluster import KMeans as KMeans_sk, AffinityPropagation
from utils.utils import IS_DEV, FILES, exist, download_file_ftp, bash

device = 'cuda' if cuda.is_available() else 'cpu'

VEC_DIR = 'vectors_small' if IS_DEV else 'vectors'
VEC_LARGE_FILE = 'np_arr.npy'
_dir = f'{FILES}/{VEC_DIR}'
N_USERS = 200 if IS_DEV else 1024
FRAC_DF = 1. if IS_DEV else 1.
path_labels_kmeans, path_labels_aff = f'{_dir}/labels_kmeans.npy', f'{_dir}/labels_aff.npy'
path_ix_kmeans, path_ix_aff = f'{_dir}/ix_kmeans.npy', f'{_dir}/ix_aff.npy'

DF_FILE = 'df_sample_small.feather' if IS_DEV else 'df_sample.feather'
DF_FILE_GZ = f'files-{DF_FILE}.tar.gz'

"""
torch kmeans:
https://pypi.org/project/kmeans-pytorch/
https://github.com/DeMoriarty/fast_pytorch_kmeans  # used
fast vectorized users with this notebook: vec_matrix_similarity_tests_Sepana_Apr_2023.ipynb
"""


def get_clusters_torch(kind: str = 'kmeans') -> np.array:
    """
    returns the labels of the cluster

    yep! confirmed

    DEV:
    number of labels: (200,)
    confirming ix ordinal sequence: [[0 1 2 3 4] ... [3195 3196 3197 3198 3199]]. If sequential, ix can be sunset/released from duty
    shape of labes is: (3200,)

    PROD:
    number of labels: (1024,)
    confirming ix ordinal sequence: [[0 1 2 3 4] ... [270395 270396 270397 270398 270399]]. If sequential, ix can be sunset/released from duty
    shape of labes is: (270400,)
    """
    is_kmeans = kind == 'kmeans'
    path_labels = path_labels_kmeans if is_kmeans else path_labels_aff
    path_ix = path_ix_kmeans if is_kmeans else path_ix_aff
    df, ix = load_dataframe(), []

    if not exist(path_labels):
        np_arr = load_vectors()
        if is_kmeans:
            cluster = KMeans(n_clusters=N_USERS)
        else:
            cluster = AffinityPropagation()

        # df_small = df.sample(frac=FRAC_DF).copy()
        df_small = df.copy()  # fraction not used - df used as is for simplicity
        print(f'sample df_small: {len(df_small)}')
        df_small['ix'] = df_small.index
        df_small = df_small.reset_index(drop=True)

        ix = df_small['ix'].to_numpy()
        np_arr_small = torch.FloatTensor(np_arr[ix]).to(device)
        print(f'about to fit {ix.shape} vectors')
        labels = cluster.fit_predict(np_arr_small).cpu().numpy()

        np.save(path_labels, labels)
        np.save(path_ix, ix)
    else:
        labels = np.load(path_labels)
        ix = np.load(path_ix)
        df_small = df.iloc[ix].copy()
        df_small['ix'] = df_small.index
        df_small = df_small.reset_index(drop=True)

    for i in range(min(20, labels.max())):
        where = labels == i
        print(df_small.loc[where, 'text2'])
        print('\n===\n')

    print(f'number of labels: {np.unique(labels).shape}')
    print(f'confirming ix ordinal sequence: [{ix[:5]} ... {ix[-5:]}]. If sequential, ix can be sunset/released from duty')

    return labels


def get_clusters(kind: str = 'kmeans') -> np.array:
    """
    returns the labels of the cluster
    """
    is_kmeans = kind == 'kmeans'
    path_labels = path_labels_kmeans if is_kmeans else path_labels_aff
    path_ix = path_ix_kmeans if is_kmeans else path_ix_aff
    df, ix = load_dataframe(), []

    if not exist(path_labels):
        np_arr = load_vectors()
        if is_kmeans:
            cluster = KMeans_sk(n_clusters=N_USERS)
        else:
            cluster = AffinityPropagation()
        df_small = df.sample(frac=FRAC_DF).copy()
        print(f'sample df_small: {len(df_small)}')
        df_small['ix'] = df_small.index
        df_small = df_small.reset_index(drop=True)

        ix = df_small['ix'].to_numpy()
        np_arr_small = np_arr[ix]
        print(f'about to fit {ix.shape} vectors')
        cluster.fit(np_arr_small)

        labels = np.array(cluster.labels_)
        np.save(path_labels, labels)
        np.save(path_ix, ix)
    else:
        labels = np.load(path_labels)
        ix = np.load(path_ix)
        df_small = df.iloc[ix].copy()
        df_small['ix'] = df_small.index
        df_small = df_small.reset_index(drop=True)

    for i in range(min(20, labels.max())):
        where = labels == i
        print(df_small.loc[where, 'text2'])
        print('\n===\n')

    print(f'number of labels: {np.unique(labels).shape}')

    return labels


def load_vectors() -> np.array:

    np_arr = np.load(f'{_dir}/{VEC_LARGE_FILE}')
    print(f'loaded np_arr as tensor of shape: {np_arr.shape}')
    return np_arr


def load_dataframe() -> pd.DataFrame:
    if not exist(f'{FILES}/{DF_FILE}'):
        print('executing internal ftp download for dataframe')
        download_file_ftp(DF_FILE_GZ, FILES)
        bash(f'tar -zxvf {FILES}/{DF_FILE_GZ}; rm {FILES}/{DF_FILE_GZ}')
    df = pd.read_feather(f'{FILES}/{DF_FILE}')
    del df['text']
    return df


if __name__ == '__main__':
    # get_clusters()
    # get_clusters(kind='aff')
    get_clusters_torch()
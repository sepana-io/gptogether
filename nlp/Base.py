# from os import makedirs
# from pathlib import Path
# from utils.ssh import ssh_call
import re
import traceback
import pandas as pd
import numpy as np
import torch
from utils.utils import IS_DEV, FILES, exist, download_file_ftp, bash
from utils.ai import get_query_vector

DF_FILE = 'df_sample_small.feather' if IS_DEV else 'df_sample.feather'
DF_FILE_GZ = f'files-{DF_FILE}.tar.gz'

VEC_DIR = 'vectors_small' if IS_DEV else 'vectors'
TAR_NAME = 'vecs.npy.tar.gz'
VEC_LARGE_FILE = 'np_arr.npy'
_dir = f'{FILES}/{VEC_DIR}'
PATH_LABELS, PATH_IX = f'{_dir}/labels_kmeans.npy', f'{_dir}/ix_kmeans.npy'
PATH_DF_FEATHER = f'{FILES}/{DF_FILE}'
PATH_DF_FEATHER_CSV = f'{PATH_DF_FEATHER}.csv'
r_chunk = re.compile(r'(?<=_)\d+')
MAX_WORDS = 20
QUERY_THRESHOLD_RATIO = MAX_WORDS // 5
COLUMN_USER_ID = 'user_id'


class Base:

    def __init__(self):
        super().__init__()
        self.df: pd.DataFrame = self.load_dataframe()
        self.vectors: torch.FloatTensor = self.load_vectors()

        if not exist(PATH_DF_FEATHER_CSV):
            self.save_dataframe()

    @staticmethod
    def load_labels() -> np.array:
        if not exist(PATH_LABELS):
            print('executing internal ftp download for labels')
            download_file_ftp(f'{VEC_DIR}/labels_kmeans.npy', _dir)
        labels = np.load(PATH_LABELS)
        print(f'loaded labels of shape & type: {labels.shape}, {labels.dtype}')
        return labels

    @staticmethod
    def load_vectors() -> torch.FloatTensor:

        np_arr = np.load(f'{_dir}/{VEC_LARGE_FILE}')
        print(f'loaded np_arr as tensor of shape: {np_arr.shape}')
        t: torch.FloatTensor = torch.FloatTensor(np_arr)
        return t

    def save_dataframe(self, df: pd.DataFrame = None):

        if df is None:
            df = self.df

        if df is not None:
            df.reset_index(drop=True).to_feather(PATH_DF_FEATHER)
            df = df.copy(deep=True)
            if 'chunk_no' in df:
                del df['chunk_no']
            if 'user' in df:
                del df['user']
            df.to_csv(PATH_DF_FEATHER_CSV, index=False)
            print(f'persisted df to {PATH_DF_FEATHER} and {PATH_DF_FEATHER_CSV}')

            del df

    def load_dataframe(self) -> pd.DataFrame:
        """
        columns = ('text (DELETED)', 'user', 'text2', 'chunk_no')
        :return:
        """
        if not exist(PATH_DF_FEATHER):
            print('executing internal ftp download for dataframe')
            download_file_ftp(DF_FILE_GZ, FILES)
            bash(f'tar -zxvf {FILES}/{DF_FILE_GZ}; rm {FILES}/{DF_FILE_GZ}')
        df = pd.read_feather(PATH_DF_FEATHER)
        # df['text2'] = df['text2'].astype(str).str.split().str[:MAX_WORDS].str.join(' ')
        if 'text' in df:
            del df['text']

        if COLUMN_USER_ID not in df.columns:
            labels_aka_user_ids: np.array = self.load_labels()
            df[COLUMN_USER_ID] = labels_aka_user_ids
            self.save_dataframe(df)
            print(f'saved main df with the {COLUMN_USER_ID} AKA labels')

        return df

    def get_top_n_search_results(self, query: str, top_n: int = 10, max_words: int = MAX_WORDS) -> dict:

        df = self.df

        # for shorter queries (fewer words) - vectorize as query - for longer ones use same vectorization
        # as the vector db
        is_query = len(query.split()) < QUERY_THRESHOLD_RATIO
        qv = get_query_vector(query, is_query).T  # transposed = 768, 1 (original = 1, 768)

        scores_text = self.vectors @ qv
        top_n_indices = scores_text.argsort(dim=0, descending=True).squeeze()[:top_n]

        df = df.iloc[top_n_indices].copy().reset_index(drop=True)
        df['score'] = scores_text[top_n_indices].squeeze()
        df = df.loc[:, ['text2', 'user', 'score']]
        df['text2'] = df['text2'].astype(str).str.split().str[:max_words].str.join(' ')

        return {'rows': df.to_dict('records')}

    # region boiler
    def __del__(self):
        try:
            pass
        except:
            # print(traceback.format_exc())
            traceback.format_exc()
            pass

    def __enter__(self):
        return self

    def __exit__(self, type_, value, traceback_):
        self.__del__()

    # endregion boiler

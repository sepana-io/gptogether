from json import dumps
from Base import re
from utils.ai import init_model, get_query_vector
from DataSync import DataSync, torch, pd, COLUMN_TEXT, df_from_sql, SALIENT_VEC, SALIENT_VEC_KEY, COLUMN_USER_ID, \
    COLUMN_USER_ID_EXTERNAL, P_SUBJECT, P_SUBJECT_KEY, BLANK, P_SUBJECT_HASH, P_SUBJECT_HASH_KEY, COLUMN_CONV_ID
from utils.db import list_to_sql, update_when_then
from utils.utils import get_hash

r_newline = re.compile(r'[.\n]\s+')
MIN_WORD_SUBJECT = 5  # minimum 5 words for subject


class VectorizeUsersPrompts(DataSync):

    def __init__(self):
        super().__init__()
        init_model()
        self.sync_users_n_prompts()

    def sync_users_n_prompts(self):
        self.vectorize_missing_prompts()
        self.vectorize_users_mean_vectors()
        self.generate_p_subject()

    def generate_p_subject(self):

        df: pd.DataFrame = self.df_users
        where = df[P_SUBJECT] == BLANK
        where |= self.check_p_subject_hash(df)

        if not sum(where):
            return

        # confirm there are none null prompt vectors
        df_zeros: pd.DataFrame = df.loc[where.tolist()]
        user_ids = df_zeros[COLUMN_USER_ID].tolist()
        prompt_vecs_ixs = self.df[self.df[COLUMN_USER_ID].isin(user_ids)].index.tolist()
        if not self.vectors[prompt_vecs_ixs].sum().item():
            return

        df_zeros[P_SUBJECT] = df_zeros[COLUMN_USER_ID].apply(self.get_user_subject)

        df.loc[where.tolist(), P_SUBJECT] = df_zeros[P_SUBJECT]
        self.users = self.df_to_users(df)

        ex_user_ids = list_to_sql(df_zeros[COLUMN_USER_ID_EXTERNAL].tolist())
        sql = f"""select user_id, extra_metadata from gptogether_users
                where user_id in ({ex_user_ids})"""
        df = df_from_sql(sql)
        d_id_ix = {iid: i for i, iid in enumerate(df_zeros[COLUMN_USER_ID_EXTERNAL].tolist())}
        df['ix'] = df[COLUMN_USER_ID].apply(d_id_ix.get)
        df = df.sort_values('ix').reset_index(drop=True)  # make sure the order is the same as in df_zeroes
        del df['ix']

        where = df['extra_metadata'].isnull()
        if sum(where):
            blank_dicts = [{} for _ in range(sum(where))]
            df.loc[where, 'extra_metadata'] = blank_dicts

        # subjects = df_zeros[P_SUBJECT].str.split(r_newline).str[0].tolist()  # DONE - solve "Bitcoin vs" - min words
        subjects = df_zeros[P_SUBJECT].apply(self.min_words).tolist()  # DONE - solve "Bitcoin vs" - min words
        hashes = df_zeros[P_SUBJECT_HASH].tolist()
        dicts: list = df['extra_metadata'].tolist()
        for i in range(len(dicts)):
            dicts[i][P_SUBJECT_KEY] = subjects[i]  # keys here for persisting to db (_768 or not suffix)
            dicts[i][P_SUBJECT_HASH_KEY] = hashes[i]
        dicts = [dumps(o) for o in dicts]
        df['extra_metadata'] = dicts

        update_when_then(df, COLUMN_USER_ID, 'extra_metadata', 'gptogether_users')
        print(f'not sure at all... but at last, yes... updated p_subjects for {len(df)} users')

    def vectorize_users_mean_vectors(self):
        """
        ['prompt_subject', 'salient_vec', 'sys_user_name', 'user_id',
         'user_id_external', 'user_name']
        :return:
        """
        vecs = self.all_users_avg_vecs

        where = torch.count_nonzero(vecs, dim=-1) < 1
        if not sum(where):
            return

        df: pd.DataFrame = self.df_users

        # confirm there are none null prompt vectors
        df_zeros: pd.DataFrame = df.loc[where.tolist()]
        user_ids = df_zeros[COLUMN_USER_ID].tolist()
        prompt_vecs_ixs = self.df[self.df[COLUMN_USER_ID].isin(user_ids)].index.tolist()
        if not self.vectors[prompt_vecs_ixs].sum().item():
            return

        def fn_mean(user_id: int) -> torch.FloatTensor:
            """
            just calculate mean - should be fast
            :param user_id:
            :return:
            """
            salient_vec: torch.FloatTensor = self.get_user_vectors(user_id).mean(dim=0)
            return salient_vec
        df_zeros[SALIENT_VEC] = df_zeros[COLUMN_USER_ID].apply(fn_mean)
        df.loc[where.tolist(), SALIENT_VEC] = df_zeros[SALIENT_VEC]

        self.users = self.df_to_users(df)

        vecs = df_zeros[SALIENT_VEC].tolist()
        ex_user_ids = list_to_sql(df_zeros[COLUMN_USER_ID_EXTERNAL].tolist())
        sql = f"""select user_id, extra_metadata from gptogether_users
        where user_id in ({ex_user_ids})"""
        df = df_from_sql(sql)
        d_id_ix = {iid: i for i, iid in enumerate(df_zeros[COLUMN_USER_ID_EXTERNAL].tolist())}
        df['ix'] = df[COLUMN_USER_ID].apply(d_id_ix.get)
        df = df.sort_values('ix').reset_index(drop=True)  # make sure the order is the same as in df_zeroes
        del df['ix']

        where = df['extra_metadata'].isnull()
        if sum(where):
            blank_dicts = [{} for _ in range(sum(where))]
            df.loc[where, 'extra_metadata'] = blank_dicts

        dicts: list = df['extra_metadata'].tolist()
        for i in range(len(dicts)):
            dicts[i][SALIENT_VEC_KEY] = vecs[i].tolist()  # keys here for persisting to db (_768 or not suffix)
        dicts = [dumps(o) for o in dicts]
        df['extra_metadata'] = dicts

        update_when_then(df, COLUMN_USER_ID, 'extra_metadata', 'gptogether_users')
        print(f'not sure at all... but at last, yes... updated salient vectors for {len(df)} users')

    def vectorize_missing_prompts(self):
        """
        get the indices of the vectors which are all 0
        :return:
        """
        where = torch.count_nonzero(self.vectors, dim=-1) < 1  # 3210, sum(where) = 10
        where = where.numpy() & self.df['user'].notnull()
        if not sum(where):
            return
        df_zeros: pd.DataFrame = self.df.loc[where]
        texts = df_zeros[COLUMN_TEXT].tolist()

        vecs = get_query_vector(texts, is_query=False)
        self.vectors[where] = vecs

        ex_user_ids = list_to_sql(df_zeros['user'].tolist())
        sql = f"""select {COLUMN_CONV_ID}, user_id, additional_metadata from gptogether_conversations
where {COLUMN_CONV_ID} in ({ex_user_ids})"""
        df = df_from_sql(sql)
        d_id_ix = {iid: i for i, iid in enumerate(df_zeros['user'].tolist())}
        df['ix'] = df[COLUMN_CONV_ID].apply(d_id_ix.get)
        df = df.sort_values('ix').reset_index(drop=True)  # make sure the order is the same as in df_zeroes
        del df['ix']

        where = df['additional_metadata'].isnull()
        if sum(where):
            blank_dicts = [{} for _ in range(sum(where))]
            df.loc[where, 'additional_metadata'] = blank_dicts

        dicts: list = df['additional_metadata'].tolist()
        for i in range(len(dicts)):
            dicts[i][SALIENT_VEC_KEY] = vecs[i].tolist()  # keys here for persisting to db (_768 or not suffix)
        dicts = [dumps(o) for o in dicts]
        df['additional_metadata'] = dicts

        update_when_then(df, COLUMN_CONV_ID, 'additional_metadata', 'gptogether_conversations')
        print(f'not sure at all... but at last, yes... updated vectors for {len(df)} prompts')

    def check_p_subject_hash(self, df: pd.DataFrame) -> pd.Series:

        def fn_hash(user_id: int) -> str:
            df0 = self.get_df_for_user(user_id)
            texts = ''.join(sorted(df0[COLUMN_TEXT].tolist()))
            return get_hash(texts)

        where = df[COLUMN_USER_ID_EXTERNAL].notnull()  # only external users
        df['hash'] = None
        df.loc[where, 'hash'] = df.loc[where, COLUMN_USER_ID].apply(fn_hash)
        where &= (df['hash'] != df[P_SUBJECT_HASH])
        df[P_SUBJECT_HASH] = df['hash']
        del df['hash']
        return where

    @staticmethod
    def min_words(text: str) -> str:
        lines: list = r_newline.split(text)
        ret = []
        for line in lines:
            if len(ret) >= MIN_WORD_SUBJECT:
                break
            ret.extend(line.split())

        return ' '.join(ret)

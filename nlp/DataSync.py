import pandas as pd

from User import User, SALIENT_VEC, torch, P_SUBJECT, COLUMN_TEXT
from UserBase import COLUMN_USER_ID, COLUMN_USER_ID_EXTERNAL, COLUMN_USER_NAME, BLANK, np, COLUMN_SYS_USER_NAME
from Base import IS_DEV
from utils.db import df_from_sql, list_to_sql

ERROR, STATUS = 'error', 'status'
SALIENT_VEC_KEY, P_SUBJECT_KEY, P_SUBJECT_HASH = SALIENT_VEC, P_SUBJECT, 'p_subject_hash'
CONV_VEC, CONV_HASH, CONV_SUBJECT = 'conv_vec', 'conv_hash', 'conv_subject'
P_SUBJECT_HASH_KEY = P_SUBJECT_HASH
CONV_VEC_KEY, CONV_HASH_KEY, CONV_SUBJECT_KEY = CONV_VEC, CONV_HASH, CONV_SUBJECT
if IS_DEV:
    SALIENT_VEC_KEY += '_768'
    P_SUBJECT_KEY += '_768'
    P_SUBJECT_HASH_KEY += '_768'
    CONV_VEC_KEY += '_768'
    CONV_HASH_KEY += '_768'
    CONV_SUBJECT_KEY += '_768'

COLUMN_CONV_ID = 'storage_index'


class DataSync(User):

    def __init__(self):
        super().__init__()
        self.error_key = ERROR
        self.sync_blank_users_prompts()

    def sync_blank_users_prompts(self):
        self.load_external_users()
        self.load_external_prompts()

    # and c.{COLUMN_CONV_ID} is not null
    def load_external_prompts(self):
        df = self.df
        where = df['chunk_no'] < 0
        uid_ext = df.loc[where, 'user'].tolist()
        u_not_in = '' if not uid_ext else f'and c.{COLUMN_CONV_ID} not in({list_to_sql(uid_ext)})'

        sql = f"""SELECT u.user_id as {COLUMN_USER_ID_EXTERNAL}, c.title_prompt, c.additional_metadata, c.{COLUMN_CONV_ID}  
FROM gptogether_users u
LEFT JOIN (select * from gptogether_conversations where visibility_setting != 'private') c 
ON u.user_id = c.user_id
where u.type_of_login != 'system-generated' {u_not_in}
order by u.created_at"""

        df = df_from_sql(sql)
        if not len(df):
            return
        where = df['title_prompt'].isnull()
        df.loc[where, 'title_prompt'] = BLANK

        df[SALIENT_VEC] = df['additional_metadata'].str[SALIENT_VEC_KEY]
        where = df[SALIENT_VEC].isnull()
        if (n_rows := sum(where)):
            print(f'prompt adding {n_rows} torch.zeros vectors...')
            v_size = self.vectors.shape[-1]
            df.loc[where, SALIENT_VEC] = df.loc[where, SALIENT_VEC].apply(lambda x: torch.zeros(v_size))

        df[SALIENT_VEC] = df[SALIENT_VEC].apply(lambda x: torch.FloatTensor(x))
        vecs = torch.vstack(df[SALIENT_VEC].tolist())
        self.vectors = torch.vstack((self.vectors, vecs))

        del df[SALIENT_VEC]
        del df['additional_metadata']

        d_ueid_uid = {v.get(COLUMN_USER_ID_EXTERNAL, k): v.get(COLUMN_USER_ID) for k, v in self.users.items()
                      if v.get(COLUMN_USER_ID_EXTERNAL)}
        df[COLUMN_USER_ID] = df[COLUMN_USER_ID_EXTERNAL].apply(d_ueid_uid.get)

        del df[COLUMN_USER_ID_EXTERNAL]
        """
        Index(['user', 'text2', 'chunk_no', 'user_id'], dtype='object')        
        df columns Index(['user_id_external', 'title_prompt', 'user_id'], dtype='object')
        """
        df[COLUMN_TEXT] = df['title_prompt']
        df['user'] = df[COLUMN_CONV_ID]
        df['chunk_no'] = -1
        df = df.loc[:, self.df.columns.tolist()]
        self.df = pd.concat((self.df, df)).reset_index(drop=True)

        print(f'merged {len(df)} rows into self.df, totaling to: {len(self.df)}')
        # print('self df columns', self.df.columns)

    def load_external_users(self):
        df_users = self.df_users
        u_not_in = ''
        if COLUMN_USER_ID_EXTERNAL in df_users:
            where = df_users[COLUMN_USER_ID_EXTERNAL].notnull()
            uid_ext = df_users.loc[where, COLUMN_USER_ID_EXTERNAL].tolist()
            u_not_in = '' if not uid_ext else f'and user_id not in({list_to_sql(uid_ext)})'

        sql = f"""select user_id as {COLUMN_USER_ID_EXTERNAL}, name as {COLUMN_USER_NAME}, extra_metadata
from gptogether_users
where type_of_login != 'system-generated' {u_not_in}
order by created_at
"""
        # COLUMN_USER_ID_EXTERNAL will be already in the user
        df = df_from_sql(sql)
        if not len(df):
            return
        print(f'got {len(df)} external users from db...')
        df[P_SUBJECT] = df['extra_metadata'].str[P_SUBJECT_KEY]
        df[P_SUBJECT_HASH] = df['extra_metadata'].str[P_SUBJECT_HASH_KEY]
        where = df[P_SUBJECT].isnull()
        df.loc[where, P_SUBJECT] = BLANK
        print(f'{sum(where)} blank {P_SUBJECT}')

        df[COLUMN_USER_ID] = np.arange(len(df)) + len(self.users)
        df[COLUMN_SYS_USER_NAME] = df[COLUMN_USER_ID].apply(self.get_sys_user_name)
        print(f'assigning ordinal user_ids starting at {len(self.users)} of length: {len(df)}')

        df[SALIENT_VEC] = df['extra_metadata'].str[SALIENT_VEC_KEY]
        where = df[SALIENT_VEC].isnull()
        if (n_rows := sum(where)):
            print(f'adding {n_rows} torch.zeros salient vectors...')
            v_size = self.vectors.shape[-1]
            df.loc[where, SALIENT_VEC] = df.loc[where, SALIENT_VEC].apply(lambda x: torch.zeros(v_size))
        df[SALIENT_VEC] = df[SALIENT_VEC].apply(lambda x: torch.FloatTensor(x))

        del df['extra_metadata']

        users = self.df_to_users(df)
        self.users.update(users)
        print(f'updated self.users to {len(self.users)}')

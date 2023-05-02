from VectorizeUsersPrompts import VectorizeUsersPrompts, pd, df_from_sql, COLUMN_USER_ID_EXTERNAL, COLUMN_CONV_ID, \
    torch, get_hash, dumps, update_when_then, BLANK
from DataSync import CONV_VEC, CONV_HASH, CONV_SUBJECT, CONV_VEC_KEY, CONV_HASH_KEY, CONV_SUBJECT_KEY
from UserBase import _dir
from utils.utils import get_conversation, get_conversations, IS_DEV, exist, unpickle_it, pickle_it
from utils.ai import get_query_vector, get_qry_vec_bulk
CONV, HASH_NEW = 'conv', 'hash_new'

PATH_CONVS, PATH_CONVS_DF = f'{_dir}/convs.feather', f'{_dir}.df_convs.pkl'


class Conversations(VectorizeUsersPrompts):

    def __init__(self, is_sync_convs: int = 0):
        super().__init__()
        self.df_conversations: pd.DataFrame = pd.DataFrame()
        self.conv_vecs: torch.FloatTensor = torch.FloatTensor([])
        if IS_DEV or is_sync_convs:  # on production, it takes long and is called from a crontab job
            self.sync_convs()
            # if exist(PATH_CONVS) and exist(PATH_CONVS_DF):  # TODO TEMP
            #     self.load_convs()
            # else:
            #     self.sync_convs()
        elif exist(PATH_CONVS) and exist(PATH_CONVS_DF):
            self.load_convs()

    def save_convs(self):
        columns = [o for o in self.df_conversations.columns if o != CONV_VEC]
        self.df_conversations.loc[:, columns].to_feather(PATH_CONVS_DF)  # without the vec column
        pickle_it(PATH_CONVS, self.conv_vecs)
        print(f'saved df_conversations and conv_vecs to files')

    def load_convs(self):
        self.conv_vecs = unpickle_it(PATH_CONVS)
        df_conversations = pd.read_feather(PATH_CONVS_DF)
        df_conversations['ix'] = df_conversations.index
        df_conversations[CONV_VEC] = df_conversations['ix'].apply(lambda x: self.conv_vecs[x])
        del df_conversations['ix']
        self.df_conversations = df_conversations
        print(f'loaded df_conversations and conv_vecs from files')

    def get_conv(self, storage_index: str) -> tuple[torch.FloatTensor, int]:
        """
        :param storage_index:
        :return:
        """
        df = self.df_conversations
        where = df[COLUMN_CONV_ID] == storage_index
        if not sum(where):
            return torch.FloatTensor(), -1
        _df = df.loc[where]
        return _df[CONV_VEC].tolist()[0], _df.index.tolist()[0]

    def sync_convs(self):
        df_conv_db = self.get_conversations()
        # always download all conversations to calculate hash and compare to existing hash
        df_all_convs = self.download_all_conversations(df_conv_db[COLUMN_CONV_ID].tolist())

        def fn_hash(_id: str) -> str:
            """
            calculate hash for conv texts
            :param _id:
            :return:
            """
            where = df_all_convs[COLUMN_CONV_ID] == _id
            df0 = df_all_convs.loc[where]
            texts = ''.join(sorted(df0[CONV].tolist()))
            return get_hash(texts)

        df_conv_db[HASH_NEW] = df_conv_db[COLUMN_CONV_ID].apply(fn_hash)

        self.vectorize_conversations(df_conv_db, df_all_convs)

        self.save_convs()

    def vectorize_conversations(self, df: pd.DataFrame, df_all_convs: pd.DataFrame):

        vecs = torch.vstack(df[CONV_VEC].tolist())
        where = (torch.count_nonzero(vecs, dim=-1) < 1).numpy()
        where |= (df[HASH_NEW] != df[CONV_HASH])
        df[CONV_HASH] = df[HASH_NEW]  # HASHES set there
        if not sum(where):
            self.conv_vecs = vecs
            self.df_conversations = df
            return

        def fn_vec(conv_id: str) -> torch.FloatTensor:
            where2 = df_all_convs[COLUMN_CONV_ID] == conv_id
            texts = df_all_convs.loc[where2, CONV].tolist()
            if not texts:
                texts = [BLANK]
            # vec = get_query_vector(texts, is_query=False).mean(dim=0)
            vec = get_qry_vec_bulk(texts, is_query=False).mean(dim=0)
            print(f'got result vector back for {len(texts)}')
            return vec

        def fn_conv_subject(conv_id: str) -> str:
            where2 = df_all_convs[COLUMN_CONV_ID] == conv_id
            texts = df_all_convs.loc[where2, CONV].tolist()
            if not texts:
                texts = [BLANK]
            subject = self.get_user_subject(-1, texts)
            print(f'got result subject back for {len(texts)}: {subject}')
            return subject

        df.loc[where, CONV_VEC] = df.loc[where, COLUMN_CONV_ID].apply(fn_vec)
        df.loc[where, CONV_SUBJECT] = df.loc[where, COLUMN_CONV_ID].apply(fn_conv_subject)

        self.conv_vecs = torch.vstack(df[CONV_VEC].tolist())
        self.df_conversations = df

        self.persist_to_db(df.loc[where].copy(deep=True))

    @staticmethod
    def persist_to_db(df: pd.DataFrame):

        dicts: list = df['additional_metadata'].tolist()
        dicts = [o if o else {} for o in dicts]
        vecs = df[CONV_VEC].tolist()
        hashes = df[CONV_HASH].tolist()
        subjects = df[CONV_SUBJECT].tolist()
        for i in range(len(dicts)):
            dicts[i][CONV_VEC_KEY] = vecs[i].tolist()
            dicts[i][CONV_HASH_KEY] = hashes[i]
            dicts[i][CONV_SUBJECT_KEY] = subjects[i]
        dicts = [dumps(o) for o in dicts]
        df['additional_metadata'] = dicts

        update_when_then(df, COLUMN_CONV_ID, 'additional_metadata', 'gptogether_conversations')
        print(f'not sure at all... but at last, yes... updated vectors, hashes, conv_subjects for {len(df)} conversations')

    @staticmethod
    def download_all_conversations(conv_ids: list) -> pd.DataFrame:
        # ls_conv0 = [(k.get(COLUMN_CONV_ID), k.get('message_history')) for o in conv_ids
        #             if (k := get_conversation(o)) and k.get(COLUMN_CONV_ID) and k.get('message_history')]
        # ls_conv0 = [{COLUMN_CONV_ID: o[0], CONV: [k.get('content') for k in o[1]]} for o in ls_conv0]
        # df0 = pd.DataFrame(ls_conv0).explode(CONV)

        convs = get_conversations(conv_ids)
        ls_conv = [(k.get('document_id'), k.get('message_history')) for k in convs
                   if k.get('document_id') and k.get('message_history')]

        ls_conv = [{COLUMN_CONV_ID: o[0], CONV: [k.get('content') for k in o[1]]} for o in ls_conv]
        df = pd.DataFrame(ls_conv).explode(CONV)
        return df

    def get_conversations(self) -> pd.DataFrame:

        sql = f"""SELECT u.user_id as {COLUMN_USER_ID_EXTERNAL}, c.title_prompt, c.additional_metadata, c.{COLUMN_CONV_ID}  
        FROM gptogether_users u
        JOIN (select * from gptogether_conversations where visibility_setting != 'private') c 
        ON u.user_id = c.user_id
        where u.type_of_login != 'system-generated'
        order by u.created_at"""

        df: pd.DataFrame = df_from_sql(sql)

        df[CONV_VEC] = df['additional_metadata'].str[CONV_VEC_KEY]
        where = df[CONV_VEC].isnull()
        if (n_rows := sum(where)):
            print(f'prompt adding {n_rows} torch.zeros vectors for conversations...')
            v_size = self.vectors.shape[-1]
            df.loc[where, CONV_VEC] = df.loc[where, CONV_VEC].apply(lambda x: torch.zeros(v_size))

        df[CONV_VEC] = df[CONV_VEC].apply(lambda x: torch.FloatTensor(x))
        df[CONV_HASH] = df['additional_metadata'].str[CONV_HASH_KEY]
        df[CONV_SUBJECT] = df['additional_metadata'].str[CONV_SUBJECT_KEY]

        return df



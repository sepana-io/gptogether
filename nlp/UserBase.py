from time import sleep
from random import sample, uniform
from math import ceil

from Base import Base, torch, exist, _dir, VEC_DIR, np, pd, MAX_WORDS, COLUMN_USER_ID
from utils.utils import unpickle_it, pickle_it, download_file_ftp
from utils.ai import num_tokens_from_messages, openai_call


FILE_USERS = 'users.pkl'
PATH_USERS, MAX_TOKENS = f'{_dir}/{FILE_USERS}', 3900
PATH_USERS_CSV = PATH_USERS.replace('.pkl', '.csv')
COLUMN_TEXT, COLUMN_SYS_USER_NAME, COLUMN_USER_ID_EXTERNAL, COLUMN_USER_NAME, BLANK = \
    'text2', 'sys_user_name', 'user_id_external', 'user_name', 'BLANK'

SALIENT_VEC, P_SUBJECT = 'salient_vec', 'prompt_subject'
SLEEP_MIN, SLEEP_MAX = .2, 1.3
PERSIST_EVERY = 50
PROMPT_SUBJECT = """{texts}\n\nWrite a short title, describing the most important features from the lines above.

Short Title:"""


class UserBase(Base):

    def __init__(self):
        super().__init__()

        # self.labels_aka_user_ids: np.array = self.df[COLUMN_USER_ID].to_numpy()
        print(f'(UserBase construct) from df cache - labels_aka_user_ids: '
              f'[{self.labels_aka_user_ids[:5]} ... {self.labels_aka_user_ids[-5:]}]')

        self.users: dict = self.load_users()

        if not self.users:
            u_name = self.get_sys_user_name(-11)
            self.users = {u_name: {
                P_SUBJECT: 'BLANK', SALIENT_VEC: torch.FloatTensor()},
                COLUMN_USER_ID: -11, COLUMN_USER_ID_EXTERNAL: u_name
            }
        elif not exist(PATH_USERS_CSV):
            self.persist_users()

        # DONE - consider making these properties as well
        # self.all_users_avg_vecs: torch.FloatTensor = self.get_all_other_user_salient_vecs(-1)
        # self.df_users = self.users_to_df()

    @property
    def df_users(self) -> pd.DataFrame:
        return self.users_to_df()

    @property
    def all_users_avg_vecs(self) -> torch.FloatTensor:
        return self.get_all_other_user_salient_vecs(-1)

    @property
    def labels_aka_user_ids(self) -> np.array:
        return self.df[COLUMN_USER_ID].to_numpy()

    def persist_users(self, users: dict = None):

        refresh_user_dict = 0
        if not users:
            users = self.users
            refresh_user_dict = 1

        df: pd.DataFrame = self.users_to_df(users)
        # self.df_users = df.copy(deep=True)

        users = self.df_to_users(df)
        pickle_it(PATH_USERS, users)
        if refresh_user_dict:
            self.users = users  # do this to update the sys_user_name

        del df[SALIENT_VEC]
        df.to_csv(PATH_USERS_CSV, index=False)

        print(f'persisted correct users to {PATH_USERS}...')
        print(f'saved users also as csv to {PATH_USERS_CSV}...')

    def load_users(self) -> dict:
        if exist(PATH_USERS):
            users = unpickle_it(PATH_USERS)
            print(f'loaded {len(users)} users from pickle')
        else:
            remote_path = f'{VEC_DIR}/{FILE_USERS}'
            print(f'attempting download {remote_path}')
            download_file_ftp(remote_path, _dir)
            users = {} if not exist(PATH_USERS) else unpickle_it(PATH_USERS)

        if users:
            should_persist = 0
            df_users = self.users_to_df(users)
            if COLUMN_USER_ID not in df_users:
                print(f'no {COLUMN_USER_ID} in users... adding it')
                should_persist += 1
                df_users[COLUMN_USER_ID] = df_users[COLUMN_SYS_USER_NAME].apply(self.get_user_id_from_sys_name)
            if df_users[COLUMN_USER_ID].min() < 0:
                print(f'{COLUMN_USER_ID} has negatives... removing them')
                should_persist += 1
                where = df_users[COLUMN_USER_ID] < 0
                df_users = df_users.loc[~where].reset_index(drop=True)
                users = self.df_to_users(df_users)  # !!!
            if should_persist:
                self.persist_users(users)

        return users

    def generate_synthetic_users(self):
        """
        this is a one time run from outside this project (in colab for example)
        divide the queries/prompts dataset into 'users' by using kmeans clustering
        per each query/prompt cluster generate a short subject/title describing it
        :return:
        """
        n_unique_labels = np.unique(self.labels_aka_user_ids).shape[0]
        for i in range(n_unique_labels):
            name = self.get_sys_user_name(i)
            if name in self.users:
                continue
            subject: str = self.get_user_subject(i)
            # TODO - add here additional stuff - conversations, etc...
            # salient_vec: torch.FloatTensor = self.vectors[self.get_ixs_for_user(i)].mean(dim=0)
            salient_vec: torch.FloatTensor = self.get_user_vectors(i).mean(dim=0)
            self.users[name] = {'prompt_subject': subject, SALIENT_VEC: salient_vec}
            if i and not i % PERSIST_EVERY:
                pickle_it(PATH_USERS, self.users)
                print(f'saved users dict: {i}')
            sleep(uniform(SLEEP_MIN, SLEEP_MAX))

        pickle_it(PATH_USERS, self.users)  # never forget the ending

    def get_user_subject(self, i: int, texts: list = None) -> str:
        """
        get a short title/description from N lines of queries/prompts
        :param i:
        :param texts:
        :return:
        """
        if not texts:
            df = self.get_df_for_user(i)
            df[COLUMN_TEXT] = df[COLUMN_TEXT].astype(str).str.split().str[:MAX_WORDS].str.join(' ')
            texts = df[COLUMN_TEXT].tolist()
        texts = self.fit_list_for_subject(texts)

        # return 'TODO temp'

        prompt = PROMPT_SUBJECT.replace('{texts}', '\n'.join(texts))
        reply = openai_call(prompt, max_tokens=64, temperature=.9)
        return reply

    @staticmethod
    def fit_list_for_subject(ls: list[str]) -> list:
        """
        confirm that list fits into prompt limits
        :param ls:
        :return:
        """
        while 1:
            n_tokens = num_tokens_from_messages('\n'.join(ls))
            if n_tokens <= MAX_TOKENS:
                break
            diff = n_tokens - MAX_TOKENS
            # n_lines_to_rm = max(ceil(diff / MAX_WORDS), 1)
            n_lines_to_rm = max(ceil(diff / max((n_tokens // len(ls)), len(ls))), 1)
            try:
                del_indices = sample(range(len(ls)), n_lines_to_rm)
            except:
                print(f'len(ls): {len(ls)}, n_lines_to_rm: {n_lines_to_rm}, \n{ls}')
                raise
            ls = [o for i, o in enumerate(ls) if i not in del_indices]

        return ls

    def get_user_vectors(self, unique_labels_ix: int) -> torch.FloatTensor:
        """
        this gets a 2D tensor of the vectorized prompts
        :param unique_labels_ix:
        :return:
        """
        u_vec: torch.FloatTensor = self.vectors[self.get_ixs_for_user(unique_labels_ix)]
        return u_vec

    def get_ixs_for_user(self, unique_labels_ix: int) -> torch.LongTensor:
        """
        get the original df indices per label_id/ordinal of labels
        :param unique_labels_ix:
        :return:
        """
        # ! noted index rather than COLUMN_IX
        return torch.LongTensor(self.get_df_for_user(unique_labels_ix).index.to_numpy())

    def get_df_for_user(self, unique_labels_ix: int) -> pd.DataFrame:
        """
        :param unique_labels_ix: [0, 1, 2...] this is the ordinal number of the unique labels, AKA |||user_id|||
        generated by kmeans
        :return:
        """
        labels_aka_user_id, i, df = self.labels_aka_user_ids, unique_labels_ix, self.df
        where = labels_aka_user_id == i
        return df.loc[where].copy()

    def get_all_other_user_salient_vecs(self, user_id: int) -> torch.FloatTensor:
        """
        get all other users vecs - used mostly to get all (by passing user_id: -1) user vecs on init/constructor
        :param user_id: - same as unique_labels_ix
        :return:
        """
        u_name = self.get_sys_user_name(user_id)
        users_but_current: list = [v.get(SALIENT_VEC) for k, v in self.users.items() if k != u_name]
        return torch.vstack(users_but_current)

    @staticmethod
    def df_to_users(df: pd.DataFrame) -> dict:
        rows: list = df.to_dict('records')
        d = {row.get(COLUMN_SYS_USER_NAME): row for row in rows}
        return d

    def users_to_df(self, users: dict = None) -> pd.DataFrame:
        if not users:
            users = self.users
        df = pd.DataFrame(list(users.values()))
        if 1 or COLUMN_SYS_USER_NAME not in df:
            df[COLUMN_SYS_USER_NAME] = users.keys()

        return df

    @staticmethod
    def get_user_id_from_sys_name(sys_name: str) -> int:
        return int(sys_name.split('_')[-1])

    @staticmethod
    def get_sys_user_name(unique_labels_ix: int):
        """
        get the key for the user
        :param unique_labels_ix: the ordinal label id
        :return:
        """
        return f'sys_user_{unique_labels_ix}'

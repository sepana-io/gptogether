import pandas as pd

from UserBase import UserBase, torch, P_SUBJECT, SALIENT_VEC, COLUMN_TEXT, np, sample, COLUMN_USER_ID_EXTERNAL, \
    COLUMN_USER_ID
from Base import QUERY_THRESHOLD_RATIO
from utils.ai import get_query_vector


class User(UserBase):

    def __init__(self):
        super().__init__()

    def get_random_users(self, top_n: int = 20, user_id: int = None) -> list:
        """
        used by the UI for displaying N random user in a dropdown
        :param top_n:
        :param user_id:
        :return:
        """
        user_ids = np.unique(self.labels_aka_user_ids).shape[0]
        rand_user_ids: list = sample(range(user_ids), top_n)
        if user_id is not None and user_id not in rand_user_ids:
            rand_user_ids.insert(0, user_id)
        ls = [{'id': uid, 'user_name': name, P_SUBJECT: self.users.get(name, {}).get(P_SUBJECT)}
              for uid in rand_user_ids if (name := self.get_sys_user_name(uid))]
        return ls

    def get_similar_user_entries_for_prompts(self, prompts: list[str], top_n: int = 10) -> list:
        """
        self-explanatory - gets user similar to a batch of prompts
        the need for this from the UX flow is questionable
        :param prompts:
        :param top_n:
        :return:
        """
        all_vecs: torch.FloatTensor = self.all_users_avg_vecs

        avg_len = sum(len(o.split()) for o in prompts) / len(prompts)
        is_query = avg_len < QUERY_THRESHOLD_RATIO
        prompt_vector_mean = get_query_vector(prompts, is_query=is_query).mean(dim=0)

        similar: torch.FloatTensor = (all_vecs @ prompt_vector_mean).squeeze()
        user_ids = similar.argsort(descending=True)[:top_n].tolist()  # first is always the current user
        scores = similar[user_ids].tolist()

        ls = self.get_users_entries(user_ids, scores)

        return ls

    def get_user_id_by_user_id_external(self, u_id_ext: str) -> int:
        df_users: pd.DataFrame = self.df_users
        if COLUMN_USER_ID_EXTERNAL not in df_users:
            return -1
        where = df_users[COLUMN_USER_ID_EXTERNAL] == u_id_ext
        if not sum(where):
            return -1

        return df_users.loc[where, COLUMN_USER_ID].tolist()[0]

    def get_user_id_external_by_user_id(self, u_id: int) -> str:
        df_users: pd.DataFrame = self.df_users
        if COLUMN_USER_ID_EXTERNAL not in df_users:
            return -1
        where = df_users[COLUMN_USER_ID] == u_id
        if not sum(where):
            return -1

        return df_users.loc[where, COLUMN_USER_ID_EXTERNAL].tolist()[0]

    def get_similar_user_entries(self, user_id: int, top_n: int = 10) -> list:
        """
        compares one user to all users to find the top N most similar
        :param user_id:
        :param top_n:
        :return:
        """
        user_ids, scores = self.get_similar_users(user_id, top_n)
        ls = self.get_users_entries(user_ids, scores)

        return ls

    def get_users_entries(self, user_ids: list[int], scores: list = None) -> list:
        if not scores:
            scores = user_ids
        ls = [{'user_name': name, 'score': scores[i],
               P_SUBJECT: self.users.get(name, {}).get(P_SUBJECT),
               'sample_prompts': self.get_sample_prompts_for_user(uid),
               COLUMN_USER_ID_EXTERNAL: self.users.get(name, {}).get(COLUMN_USER_ID_EXTERNAL)
               }
              for i, uid in enumerate(user_ids) if (name := self.get_sys_user_name(uid))]

        for i in range(len(ls)):
            ue_id = ls[i].get(COLUMN_USER_ID_EXTERNAL)
            if not (isinstance(ue_id, str) and len(str(ue_id)) > 7):
                ls[i][COLUMN_USER_ID_EXTERNAL] = ''
        return ls

    def get_similar_users(self, user_id: int, top_n: int = 10) -> tuple:
        """
        returns top_n user_ids and their scores
        :param user_id:
        :param top_n:
        :return:
        """
        all_vecs: torch.FloatTensor = self.all_users_avg_vecs
        user: torch.FloatTensor = self.get_user_vec(user_id).unsqueeze(dim=-1)

        similar: torch.FloatTensor = (all_vecs @ user).squeeze()
        similar = (1. / similar.max()) * similar  # scale to resemble cosine similarity results [0,1]
        # user_ids = similar.argsort(descending=True)[1:top_n + 1]  # first is always the current user - skip her
        user_ids = similar.argsort(descending=True)[:top_n+1]  # first is always the current user - skip her
        user_ids = user_ids[user_ids != user_id]
        return user_ids.tolist(), similar[user_ids].tolist()

    def get_user_vec(self, user_id: int) -> torch.FloatTensor:
        name = self.get_sys_user_name(user_id)
        user_vec: torch.FloatTensor = self.users.get(name, {}).get(SALIENT_VEC)
        return user_vec

    def get_sample_prompts_for_user(self, user_id: int, n: int = 10, add_dots=1) -> list:
        df = self.get_df_for_user(user_id)
        if n > len(df):
            n = len(df)
        texts = df.sample(n=n)[COLUMN_TEXT].str.split().str[:20].str.join(' ')
        if add_dots:
            texts += '...'
        return texts.to_list()

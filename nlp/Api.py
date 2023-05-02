from Conversations import Conversations, torch, COLUMN_CONV_ID, CONV_SUBJECT
from User import QUERY_THRESHOLD_RATIO
from urllib.parse import unquote
from utils.utils import Union
from utils.ai import get_query_vector, get_qry_vec_bulk


class Api(Conversations):

    def __init__(self, is_sync_convs: int = 0):
        super().__init__(is_sync_convs)

    def get_similar_conversations_by_prompts(self, prompts: list[str], top_n: int = 10) -> list:
        if not prompts:
            return []

        prompts = [unquote(o.strip()) for o in prompts if o and o.strip()]

        avg_len = sum(len(o.split()) for o in prompts) / len(prompts)
        is_query = avg_len < QUERY_THRESHOLD_RATIO
        conv_vec = get_qry_vec_bulk(prompts, is_query=is_query).mean(dim=0)
        # conv_vec = get_query_vector(prompts, is_query=is_query).mean(dim=0)

        return self.get_similar_conversations(None, top_n=top_n, conv_vec=conv_vec)

    def get_similar_conversations(self, storage_index: Union[str, None], top_n: int = 10,
                                  conv_vec: torch.FloatTensor = None, conv_ix: int = -1) -> list:

        add = 1 if conv_vec is None else 0
        if conv_vec is None:
            conv_vec, conv_ix = self.get_conv(storage_index)
            if not conv_vec.nelement():
                return []

        conv_vec = conv_vec.unsqueeze(dim=-1)
        conv_vecs = self.conv_vecs

        similar: torch.FloatTensor = (conv_vecs @ conv_vec).squeeze()
        if add:
            # scale to resemble cosine similarity results [0,1] - only in case of conv to convs similarity
            similar = (1. / similar.max()) * similar

        ixs = similar.argsort(descending=True)[:top_n + add]  # first is always the current user - skip her
        ixs = ixs[ixs != conv_ix]

        scores: list = similar[ixs].tolist()
        conv_ids: list = self.df_conversations.iloc[ixs.numpy()][COLUMN_CONV_ID].tolist()
        conv_subjects: list = self.df_conversations.iloc[ixs.numpy()][CONV_SUBJECT].tolist()

        return [{COLUMN_CONV_ID: o, CONV_SUBJECT: conv_subjects[i], 'score': scores[i]} for i, o in enumerate(conv_ids)]

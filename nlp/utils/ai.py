import numpy as np
import torch
from transformers import AutoModel, AutoTokenizer
import openai
import tiktoken
from tenacity import retry, stop_after_attempt, wait_random_exponential

from utils.utils import IS_DEV, APP_ENV, load_env_var, Union

openai.api_key = load_env_var('OPENAI_API_KEY')
OPEN_AI_MODEL = 'gpt-3.5-turbo'
MAX_TOKENS_REPLY = 256
MAX_WORDS = 15
BATCH_SIZE = 2

tokenizer, model = None, None

SPECB_QUE_BOS = None
SPECB_QUE_EOS = None

SPECB_DOC_BOS = None
SPECB_DOC_EOS = None


def init_model():
    global tokenizer, model, SPECB_QUE_BOS, SPECB_QUE_EOS, SPECB_DOC_BOS, SPECB_DOC_EOS
    m_size = '125M' if IS_DEV else '2.7B'

    print(f'env: {APP_ENV}, m_size: {m_size}')
    tokenizer = AutoTokenizer.from_pretrained(f'Muennighoff/SGPT-{m_size}-weightedmean-msmarco-specb-bitfit')
    print('tokenizer loaded')
    model = AutoModel.from_pretrained(f'Muennighoff/SGPT-{m_size}-weightedmean-msmarco-specb-bitfit')
    __ = model.eval()
    print('model loaded')

    SPECB_QUE_BOS = tokenizer.encode("[", add_special_tokens=False)[0]
    SPECB_QUE_EOS = tokenizer.encode("]", add_special_tokens=False)[0]

    SPECB_DOC_BOS = tokenizer.encode("{", add_special_tokens=False)[0]
    SPECB_DOC_EOS = tokenizer.encode("}", add_special_tokens=False)[0]


# init_model()


def unit(tensor: torch.Tensor) -> torch.Tensor:
    return tensor/tensor.norm(dim=-1).unsqueeze(dim=-1)


def tokenize_with_specb(texts, is_query):
    # Tokenize without padding
    batch_tokens = tokenizer(texts, padding=False, truncation=True)
    # Add special brackets & pay attention to them
    for seq, att in zip(batch_tokens["input_ids"], batch_tokens["attention_mask"]):
        if is_query:
            seq.insert(0, SPECB_QUE_BOS)
            seq.append(SPECB_QUE_EOS)
        else:
            seq.insert(0, SPECB_DOC_BOS)
            seq.append(SPECB_DOC_EOS)
        att.insert(0, 1)
        att.append(1)
    # Add padding
    batch_tokens = tokenizer.pad(batch_tokens, padding=True, return_tensors="pt")
    return batch_tokens


def get_weightedmean_embedding(batch_tokens, _model):
    # Get the embeddings
    with torch.no_grad():
        # Get hidden state of shape [bs, seq_len, hid_dim]
        last_hidden_state = _model(**batch_tokens, output_hidden_states=True, return_dict=True).last_hidden_state

    # Get weights of shape [bs, seq_len, hid_dim]
    weights = (
        torch.arange(start=1, end=last_hidden_state.shape[1] + 1)
        .unsqueeze(0)
        .unsqueeze(-1)
        .expand(last_hidden_state.size())
        .float().to(last_hidden_state.device)
    )

    # Get attn mask of shape [bs, seq_len, hid_dim]
    input_mask_expanded = (
        batch_tokens["attention_mask"]
        .unsqueeze(-1)
        .expand(last_hidden_state.size())
        .float()
    )

    # Perform weighted mean pooling across seq_len: bs, seq_len, hidden_dim -> bs, hidden_dim
    sum_embeddings = torch.sum(last_hidden_state * input_mask_expanded * weights, dim=1)
    sum_mask = torch.sum(input_mask_expanded * weights, dim=1)

    embeddings = sum_embeddings / sum_mask

    return embeddings


def num_tokens_from_messages(prompt: str, _model="gpt-3.5-turbo") -> int:
    """Returns the number of tokens used by a list of messages."""

    messages = [{"role": "user", "content": prompt}]
    try:
        encoding = tiktoken.encoding_for_model(_model)
    except KeyError:
        encoding = tiktoken.get_encoding("cl100k_base")
    if _model == "gpt-3.5-turbo":  # note: future models may deviate from this
        num_tokens = 0
        for message in messages:
            num_tokens += 4  # every message follows <im_start>{role/name}\n{content}<im_end>\n
            for key, value in message.items():
                num_tokens += len(encoding.encode(value))
                if key == "name":  # if there's a name, the role is omitted
                    num_tokens += -1  # role is always required and always 1 token
        num_tokens += 2  # every reply is primed with <im_start>assistant
        return num_tokens
    else:
        raise NotImplementedError(f"""num_tokens_from_messages() is not presently implemented for _model {_model}.
        See https://github.com/openai/openai-python/blob/main/chatml.md 
        for information on how messages are converted to tokens.""")


@retry(wait=wait_random_exponential(min=1, max=60), stop=stop_after_attempt(6))
def openai_call(prompt: str, max_tokens=MAX_TOKENS_REPLY, temperature=.7) -> str:

    prompt = prompt.strip()

    response = openai.ChatCompletion.create(
        model=OPEN_AI_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature,
        max_tokens=max_tokens
        # top_p=top_p,
        # frequency_penalty=0,
        # presence_penalty=0
        # ,stop=MODEL_STOP
    )

    # ret = response.choices[0].text.strip()
    # ret = response['choices'][0]['message']['content'].strip()
    ret = response.choices[0].message.content.strip()
    return ret


def get_qry_vec_bulk(texts: list[str], is_query=True) -> torch.Tensor:
    if not texts:
        return torch.FloatTensor()
    texts = [o for o in texts if o and isinstance(o, str) and o.strip()]
    texts = [' '.join(o.split()[:MAX_WORDS]) for o in texts]
    ls_texts = np.array_split(texts, len(texts)//BATCH_SIZE) if len(texts) > BATCH_SIZE else [texts]
    ls_tensors = []
    for batch in ls_texts:
        _texts = batch.tolist() if isinstance(batch, np.ndarray) else batch
        ls_tensors.append(get_query_vector(_texts, is_query))

    return torch.vstack(ls_tensors)


def get_query_vector(query: Union[str, list], is_query=True) -> torch.Tensor:
    if not isinstance(query, list):
        query = [query]
    query_embeddings = unit(get_weightedmean_embedding(tokenize_with_specb(query, is_query=is_query), model))
    return query_embeddings

# from utils.ssh import ssh_call
# from Base import Base
# from Api import Api
# from User import User

# cmd = 'cd vectors_small; tar -zcvf vecs.npy.tar.gz vec_*.npy'
# cmd = 'cd vectors; tar -zcvf vecs.npy.tar.gz vec_*.npy'  # ! LARGE - 2.4GB
# ssh_call(cmd)

# with Base() as obj:
#     # ret = obj.get_top_n_search_results('the quick brown fox jumped')
#     ret = obj.get_top_n_search_results('Alternative browser to test my website')
#     print(ret)

# with User() as obj:
#     # obj.generate_synthetic_users()
#     obj.get_all_other_user_salient_vecs(-1)

# with Api() as obj:
#     prompts = """When are self driving cars going to be operational?
# I’m pivoting away from a search infrastructure company - help give me ideas
# Is chatGPT already implemented in autonomous cars?
# Will chatGPT slow the opensource community AI research?
# Is training models and testing new architectures going to become a privilege only of large tech companies?"""
#     ret = obj.get_similar_user_entries_for_prompts(prompts.split('\n'))
#     print(ret)

# from utils.ai import openai_call
# openai_call('Say this is a test!')


from utils.utils import get_conversation
ret = get_conversation('45c7b6df-22c8-43f4-babb-78074d0ae548_kf0czf3BHegHwF0Nbhvql1fJdB93')
print(ret)
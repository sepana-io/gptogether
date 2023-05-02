from Api import Api

print('all should happen on API init')

with Api(is_sync_convs=1) as obj:
    print('all should be synced now... good luck')

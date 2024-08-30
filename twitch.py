import requests

access_token = 'x1oitnqssjyte3fus54n96zkq3k2vk'  # Aldığınız access token
client_id = 'h61e14s838l952l91az1ip425hn5wb'  # client_id'nizi ekleyin
headers = {
    'Authorization': f'Bearer {access_token}',
    'Client-Id': client_id
}

# Örnek kullanıcı ID'si
user_id = '63915144'  # Daha önce aldığınız kullanıcı ID'sini buraya yazın
response = requests.get(f'https://api.twitch.tv/helix/streams?user_id={user_id}', headers=headers)
print(response.json())

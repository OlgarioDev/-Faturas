import os, requests
from dotenv import load_dotenv

load_dotenv('.env')

url = f"{os.getenv('SUPABASE_URL')}/auth/v1/user"
apikey = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

print("URL:", url)
print("APIKEY (first 10 chars):", apikey[:10] if apikey else "None")

res = requests.get(
    url,
    headers={
        "Authorization": f"Bearer invalid",
        "apikey": apikey
    }
)
print("Response:", res.status_code, res.text)

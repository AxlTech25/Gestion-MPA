import urllib.request
import json
import sys

BASE = 'http://localhost/gestion_mpa/backend/api/v2/index.php?request='

login_req = urllib.request.Request(
    BASE + 'auth/login',
    data=json.dumps({'usuario': 'admin', 'password': 'admin123'}).encode(),
    headers={'Content-Type': 'application/json'},
    method='POST',
)
token = json.loads(urllib.request.urlopen(login_req, timeout=30).read())['token']

for path in ['ml/status', 'ml/alertas']:
    req = urllib.request.Request(
        BASE + path,
        headers={'Authorization': f'Bearer {token}'},
    )
    try:
        resp = urllib.request.urlopen(req, timeout=120)
        body = resp.read().decode()
        print(f'=== {path} HTTP {resp.status} ===')
        print(body[:500])
        data = json.loads(body)
        print('success:', data.get('success'), 'count:', len(data.get('data') or []))
    except Exception as e:
        print(f'=== {path} ERROR ===')
        print(e)
        if hasattr(e, 'read'):
            print(e.read().decode()[:500])

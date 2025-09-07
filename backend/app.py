import logging
import os
from pathlib import Path
from urllib.parse import urlencode

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
# Local modules
from note import Note
from notes_list import NoteList

# Load environment files (project root .env then .env.local overriding)
root = Path(__file__).resolve().parent.parent
env_file = root / '.env'
env_local = root / '.env.local'
if env_file.exists():
    load_dotenv(env_file, override=False)
    print(f'Loaded environment from {env_file}')
if env_local.exists():
    # allow local to override
    load_dotenv(env_local, override=True)
    print(f'Loaded environment from {env_local}')

logger = logging.getLogger('backend')

app = Flask(__name__)
# Configure CORS:
# - If CORS_ORIGINS env var is set, use it (comma-separated list).
# - Otherwise allow all origins for local development (use with caution).
cors_origins_env = os.environ.get('CORS_ORIGINS')
if cors_origins_env:
    origins = [o.strip() for o in cors_origins_env.split(',') if o.strip()]
    CORS(app, origins=origins, supports_credentials=True)
else:
    # Permissive for development so Expo web (including exp.direct URLs) can reach the backend.
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)


@app.after_request
def _add_cors_headers(response):
    # Ensure CORS headers exist for all responses (helps with some proxy setups)
    response.headers.setdefault('Access-Control-Allow-Origin', '*')
    response.headers.setdefault('Access-Control-Allow-Headers', 'Content-Type,Authorization,apikey')
    response.headers.setdefault('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    return response

# Configure Supabase client using ONLY the public variables you provided.
# NOTE: Using the anon/public key on the server is not recommended because it
# has client-level permissions and may be restricted by RLS. You asked to
# only use these two variables so we initialize with them and log a warning.
SUPABASE_URL = os.environ.get('EXPO_PUBLIC_SUPABASE_URL') or os.environ.get('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or os.environ.get('SUPABASE_SERVICE_KEY')

# log presence of env vars (do not print the full service key)
if SUPABASE_URL:
    logger.info('Supabase URL found: %s', SUPABASE_URL)
else:
    logger.warning('Supabase URL not found in environment')

if SUPABASE_SERVICE_KEY:
    display = SUPABASE_SERVICE_KEY[:6] + '...' + SUPABASE_SERVICE_KEY[-4:]
    logger.info('Supabase service key found: %s', display)
else:
    logger.warning('Supabase service key not found in environment')

supabase = None
try:
    if SUPABASE_URL and SUPABASE_SERVICE_KEY:
        from supabase import create_client
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        app.logger.info('Supabase service client configured')
    else:
        app.logger.warning('Supabase service key not found; server-side writes will be disabled')
except Exception as e:
    supabase = None
    app.logger.warning('Failed to initialize Supabase client: %s', e)

# In-memory fallback (useful for local development)
from note import Note
from notes_list import NoteList

note_store = NoteList()


@app.route('/')
def home():
    return jsonify({"message": "Hello, world!"})


@app.route('/auth/sign-up', methods=['POST'])
def auth_sign_up():
    """Create a new Supabase user via the admin API and ensure a profiles row exists.
    Server requires SUPABASE_SERVICE_ROLE_KEY to be set (service client configured).
    Request JSON: { "email": string, "password": string, "full_name": string (optional) }
    """
    payload = request.get_json(force=True) or {}
    email = (payload.get('email') or '').strip()
    password = payload.get('password')
    full_name = payload.get('full_name')

    if not email or not password:
        return jsonify({'error': 'email and password are required'}), 400

    if not supabase:
        return jsonify({'error': 'Server not configured with SUPABASE_SERVICE_ROLE_KEY'}), 500

    # Use Supabase Auth admin REST endpoint to create user
    try:
        admin_url = f"{SUPABASE_URL}/auth/v1/admin/users"
        headers = {
            'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
            'apikey': SUPABASE_SERVICE_KEY,
            'Content-Type': 'application/json',
        }
        body = {
            'email': email,
            'password': password,
            'email_confirm': True,
        }
        if full_name:
            body['user_metadata'] = {'full_name': full_name}

        import requests
        resp = requests.post(admin_url, headers=headers, json=body, timeout=10)
        if resp.status_code not in (200, 201):
            try:
                detail = resp.json()
            except Exception:
                detail = resp.text
            app.logger.warning('Supabase admin user create failed: %s', detail)

            # Detect common "already registered" messages from Supabase admin API
            msg = str(detail).lower() if detail is not None else ''
            if 'already' in msg or 'registered' in msg or 'user exists' in msg:
                return jsonify({'error': 'User already exists', 'detail': detail}), 409

            return jsonify({'error': 'Failed to create user', 'detail': detail}), 400

        user = resp.json()
        user_id = user.get('id')

        # Ensure profiles row exists
        try:
            p = supabase.table('profiles').select('*').eq('id', user_id).execute()
            profiles = getattr(p, 'data', p)
            if not profiles or len(profiles) == 0:
                supabase.table('profiles').insert({'id': user_id, 'user_name': email, 'full_name': full_name}).execute()
        except Exception:
            app.logger.exception('Failed to ensure profile row exists after signup')

        return jsonify({'message': 'User created', 'user': user}), 201
    except Exception as e:
        app.logger.exception('Sign-up handler failed')
        return jsonify({'error': 'Sign-up failed', 'detail': str(e)}), 500


@app.route('/auth/sign-in', methods=['POST'])
def auth_sign_in():
    """Exchange email+password for a Supabase session via the token endpoint and return session data.
    Request JSON: { "email": string, "password": string }
    """
    payload = request.get_json(force=True) or {}
    email = (payload.get('email') or '').strip()
    password = payload.get('password')

    if not email or not password:
        return jsonify({'error': 'email and password are required'}), 400

    # Use anon key to perform token grant (or service key if you prefer)
    anon_key = os.environ.get('EXPO_PUBLIC_SUPABASE_ANON_KEY')
    if not SUPABASE_URL or not anon_key:
        return jsonify({'error': 'Supabase configuration missing'}), 500

    try:
        token_url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
        headers = {
            'apikey': anon_key,
            'Content-Type': 'application/x-www-form-urlencoded',
        }
        data = {
            'grant_type': 'password',
            'email': email,
            'password': password,
        }
        import requests

        # Ensure we send a properly URL-encoded form body.
        try:
            from urllib.parse import urlencode
            payload = urlencode(data)
        except Exception:
            payload = data

        resp = requests.post(token_url, headers=headers, data=payload, timeout=10)
        try:
            result = resp.json()
        except Exception:
            result = {'error': 'Invalid response from auth server', 'raw': resp.text}

        # If Supabase returns a bad_json error for the form-encoded request,
        # try again using a JSON payload (some proxy setups or middlewares can
        # alter form bodies unexpectedly).
        if resp.status_code != 200:
            err_code = None
            try:
                err_code = result.get('error_code') if isinstance(result, dict) else None
            except Exception:
                err_code = None

            if err_code == 'bad_json' or (isinstance(result, dict) and 'bad_json' in str(result).lower()):
                try:
                    # Log email only; never log password
                    app.logger.info('Supabase token endpoint returned bad_json for email=%s; retrying with JSON payload', email)
                    headers_json = {'apikey': anon_key, 'Content-Type': 'application/json'}
                    resp2 = requests.post(token_url, headers=headers_json, json=data, timeout=10)
                    try:
                        result2 = resp2.json()
                    except Exception:
                        result2 = {'error': 'Invalid response from auth server', 'raw': resp2.text}

                    if resp2.status_code == 200:
                        return jsonify({'message': 'Sign-in successful', 'session': result2}), 200
                    else:
                        app.logger.warning('Token endpoint retry failed: %s', result2)
                        return jsonify({'error': 'Sign-in failed', 'detail': result2}), 401
                except Exception as e:
                    app.logger.exception('Retry to token endpoint failed')
                    return jsonify({'error': 'Sign-in failed', 'detail': str(e)}), 500

            app.logger.warning('Token endpoint returned non-200: %s', result)
            return jsonify({'error': 'Sign-in failed', 'detail': result}), 401

        return jsonify({'message': 'Sign-in successful', 'session': result}), 200
    except Exception as e:
        app.logger.exception('Sign-in handler failed')
        return jsonify({'error': 'Sign-in failed', 'detail': str(e)}), 500


@app.route('/new-note', methods=['POST'])
def r_new_note():
    payload = request.get_json(force=True) or {}
    title = payload.get('title')
    text = payload.get('text')

    # Server must have supabase service client configured for production writes
    if not supabase:
        return jsonify({'error': 'Server not configured with SUPABASE_SERVICE_ROLE_KEY'}), 500

    # 1) Verify Authorization header (client access token)
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'error': 'Missing Authorization header'}), 401

    # 2) Verify token with Supabase Auth to get the user id
    import requests
    try:
        user_resp = requests.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={
                'Authorization': auth_header,
                'apikey': SUPABASE_SERVICE_KEY,
            },
            timeout=5,
        )
    except Exception as e:
        app.logger.exception('Auth lookup failed')
        return jsonify({'error': 'Failed to verify user token', 'detail': str(e)}), 500

    if user_resp.status_code != 200:
        return jsonify({'error': 'Invalid or expired token'}), 401

    user = user_resp.json() or {}
    user_id = user.get('id')
    if not user_id:
        return jsonify({'error': 'Could not determine user id from token'}), 401

    # 3) Ensure profiles row exists (upsert)
    try:
        p = supabase.table('profiles').select('*').eq('id', user_id).execute()
        profiles = getattr(p, 'data', p)
        if not profiles or len(profiles) == 0:
            supabase.table('profiles').insert({'id': user_id, 'user_name': user.get('email')}).execute()
    except Exception:
        app.logger.exception('Failed to ensure profile row exists')
        return jsonify({'error': 'Failed to ensure profile row'}), 500

    # 4) Insert note with fk_profile_id = user_id
    try:
        insert_payload = {'fk_profile_id': user_id, 'title': title, 'text': text}
        insert_payload = {k: v for k, v in insert_payload.items() if v is not None}
        resp = supabase.table('notes').insert(insert_payload).execute()
        data = getattr(resp, 'data', resp)
        return jsonify({'message': 'New note created', 'data': data}), 201
    except Exception as e:
        app.logger.exception('Supabase insert failed')
        return jsonify({'error': 'Failed to save note to Supabase', 'detail': str(e)}), 500


@app.route('/delete-note', methods=['GET'])
def r_delete_note():
    return jsonify({"message": "Note deleted"})


@app.route('/edit-note', methods=['POST'])
def r_edit_note():
    return jsonify({"message": "Note edited"})


@app.route('/get-notes', methods=['GET'])
def r_get_notes():
    # If supabase configured, fetch notes; otherwise return in-memory list
    if supabase:
        try:
            resp = supabase.table('notes').select('*').execute()
            data = getattr(resp, 'data', resp)
            return jsonify({'notes': data}), 200
        except Exception as e:
            app.logger.exception('Failed to fetch notes from Supabase')
            return jsonify({'error': 'Failed to fetch notes', 'detail': str(e)}), 500
    else:
        return jsonify({'notes': [repr(n) for n in note_store.get_notes_list()]}), 200



if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)    app.run(host="0.0.0.0", port=5000, debug=True)
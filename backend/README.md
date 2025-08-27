Run the backend Flask server (local development)

1. Create a virtualenv and install dependencies:

   python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt

2. Set environment variables (PowerShell example):

   $env:SUPABASE_URL = "https://your-supabase-project.supabase.co";
   $env:SUPABASE_SERVICE_ROLE_KEY = "<your-service-role-key>";
   $env:FLASK_APP = "app.py";

3. Run the server:

   flask run --port 5000

Notes:
- For local testing you can also keep an anon key client-side, but the server requires the service role key for writes.
- Make sure your Supabase project has tables `profiles` and `notes` matching the expected columns used in the code.

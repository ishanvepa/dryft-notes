export async function handleSave(router?: any, note?: { title?: string; text?: string }) {
  console.log('handleSave triggered.');

  // Build request body
  const body = {
    title: note?.title ?? null,
    text: note?.text ?? null,
    created_at: new Date().toISOString(),
  };

  // Acquire current user's access token from the Supabase client so the server
  // can verify the token and associate the note with the correct profile.
  let accessToken: string | null = null;
  try {
    // import the project's supabase client
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { supabase } = require('../lib/supabase');
    // modern supabase-js: supabase.auth.getSession()
    const sessionResp = await supabase.auth.getSession();
    accessToken = sessionResp?.data?.session?.access_token ?? null;
  } catch (err) {
    console.warn('Could not read supabase session; proceeding without Authorization header', err);
    accessToken = null;
  }

  // Attempt to POST to backend /new-note endpoint. Include Bearer token when available.
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  // Use API_BASE to support web, Android emulator, and device configurations.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { API_BASE } = require('../lib/api');
  const resp = await fetch(`${API_BASE}/new-note`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      console.warn('Backend /new-note responded with non-OK status', resp.status);
    } else {
      const data = await resp.json();
      console.log('Backend response:', data);
    }
  } catch (e) {
    console.warn('Failed to POST note to backend:', e);
  }

  // Navigate after attempting to save. Prefer a provided router (expo-router).
  try {
    if (router && typeof router.push === 'function') {
      router.push('/(tabs)/landing');
      return;
    }

    // If running in a web environment, fall back to window.location so the web
    // interface navigates after saving.
    if (typeof window !== 'undefined' && window?.location) {
      window.location.href = '/(tabs)/landing';
      return;
    }

    // No router and not web — in React Native the caller should handle navigation.
    console.log('handleSave: no router provided and not running on web; caller should handle navigation on native.');
    return;
  } catch (e) {
    console.warn('handleSave navigation failed:', e);
  }
}

export default handleSave;

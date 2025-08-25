export async function handleSave(router?: any, note?: { title?: string; text?: string }) {
  console.log('handleSave triggered.');

  // Attempt to POST to backend /new-note endpoint. The backend (Python) can then persist to Supabase.
  try {
    const body = {
      title: note?.title ?? null,
      text: note?.text ?? null,
      created_at: new Date().toISOString(),
    };

    // Adjust host/port if your backend runs elsewhere.
    const resp = await fetch('http://localhost:5000/new-note', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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

  // Navigate after attempting to save
  try {
    if (router && typeof router.push === 'function') {
      router.push('/(tabs)/landing');
      return;
    }
    if (typeof window !== 'undefined') {
      window.location.href = '/(tabs)/landing';
      return;
    }
  } catch (e) {
    console.warn('handleSave navigation failed, falling back to window.location:', e);
    if (typeof window !== 'undefined') window.location.href = '/(tabs)/landing';
  }
}

export default handleSave;

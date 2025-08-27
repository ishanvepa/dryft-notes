import { API_BASE } from './api';
import { supabase } from './supabase';

export async function signUp(email: string, password: string, full_name?: string) {
  let resp;
  try {
    resp = await fetch(`${API_BASE}/auth/sign-up`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name }),
    });
  } catch (e: any) {
    throw new Error(`Network error while contacting auth server (${API_BASE}): ${e?.message || e}`);
  }

  const data = await resp.json();
  if (!resp.ok) {
    if (resp.status === 409) {
      const err = new Error('Account already exists');
      // @ts-ignore attach status for callers
      err.status = 409;
      throw err;
    }
    throw new Error(data?.error?.detail || data?.detail || JSON.stringify(data));
  }
  return data;
}

export async function signIn(email: string, password: string) {
  let resp;
  try {
    resp = await fetch(`${API_BASE}/auth/sign-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    });
  } catch (e: any) {
    throw new Error(`Network error while contacting auth server (${API_BASE}): ${e?.message || e}`);
  }

  const data = await resp.json();
  if (!resp.ok) throw new Error(data?.error?.detail || JSON.stringify(data));

  // data.session is the token response from Supabase
  const session = data.session;
  if (session && (session.access_token || session.refresh_token)) {
    try {
      // Set session into supabase client so client-side code is authenticated
      // supabase-js expects an object { access_token, refresh_token }
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
    } catch (e) {
      // Not fatal; client can still use server-side session flows
      console.warn('Failed to set supabase client session:', e);
    }
  }

  return data;
}

export async function signOut() {
  try {
  console.log('[auth] signOut: calling supabase.auth.signOut()');
  const { error } = await supabase.auth.signOut();
  console.log('[auth] signOut: supabase returned', { error });
    if (error) {
      console.warn('Client signOut returned error:', error);
      throw error;
    }
    return true;
  } catch (e) {
    console.warn('Client signOut failed:', e);
    return false;
  }
}

export default { signUp, signIn, signOut };

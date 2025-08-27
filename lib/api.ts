import { Platform } from 'react-native';

// Priority: explicit env var (useful for devices), then platform heuristics.
const envBase = process.env.EXPO_PUBLIC_API_BASE || process.env.API_BASE || null;

function pickBase() {
  if (envBase) return envBase.replace(/\/$/, '');

  // Web: assume backend on localhost:5000 (adjust if you run backend elsewhere)
  if (Platform.OS === 'web') return 'http://localhost:5000';

  // Android emulator (classic) uses 10.0.2.2 to reach host machine
  if (Platform.OS === 'android') return 'http://10.0.2.2:5000';

  // iOS simulator and many native setups can reach localhost on the host machine
  return 'http://localhost:5000';
}

export const API_BASE = pickBase();

export default API_BASE;

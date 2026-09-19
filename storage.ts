import { AppData } from '@/types';

export const STORAGE_KEY = 'iron-log:data';

export function loadFromStorage(): AppData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppData;
  } catch (err) {
    console.error('Konnte Daten nicht aus localStorage laden:', err);
    return null;
  }
}

export function saveToStorage(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Konnte Daten nicht in localStorage speichern:', err);
  }
}

export function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportAsJson(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `iron-log-export-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseImportedJson(text: string): AppData {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.exercises)) {
    throw new Error('Ungültiges Dateiformat.');
  }
  return parsed as AppData;
}

import type { AppStore } from "../types";

const STORAGE_KEY = "taskflow_store_v1";

export function loadStore(): AppStore | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppStore;
  } catch {
    return null;
  }
}

export function saveStore(store: AppStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // quota exceeded — silently ignore
  }
}

export function clearStore(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export interface SavedCaseSummary {
  id: string;
  timestamp: string;
  mode: string;
  verdict: string;
  category: string;
  score: number;
  preview: string;
  manipulationCount: number;
  urlCount: number;
}

const STORAGE_KEY = "manipulation_decoder_case_history";
const OPT_IN_KEY = "manipulation_decoder_history_opt_in";

export function getHistoryOptIn(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(OPT_IN_KEY) === "true";
}

export function setHistoryOptIn(optIn: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(OPT_IN_KEY, optIn ? "true" : "false");
  if (!optIn) {
    clearCaseHistory();
  }
}

export function getSavedCases(): SavedCaseSummary[] {
  if (typeof window === "undefined") return [];
  if (!getHistoryOptIn()) return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCaseToHistory(caseItem: SavedCaseSummary): void {
  if (typeof window === "undefined") return;
  if (!getHistoryOptIn()) return;

  try {
    const existing = getSavedCases();
    // Prepend new case, keep max 25 items
    const updated = [caseItem, ...existing.filter((c) => c.id !== caseItem.id)].slice(0, 25);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // LocalStorage quota or privacy mode error
  }
}

export function deleteCaseFromHistory(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getSavedCases();
    const updated = existing.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export function clearCaseHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

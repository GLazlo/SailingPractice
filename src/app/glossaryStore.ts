import type { Progress } from "../domain/flashcards";
import type { Lang } from "../domain/glossary";

// Shared by the Ship, Maneuvers and Knots pages.
const PROGRESS_KEY = "sailing-practice.glossary-progress";
const LEAD_KEY = "sailing-practice.glossary-lead";

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? (parsed as Progress) : {};
  } catch {
    // Private browsing, disabled storage or corrupt JSON: start from blank.
    return {};
  }
}

export function saveProgress(progress: Progress): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Nothing we can do; practice still works for this session.
  }
}

export function loadLead(): Lang {
  try {
    return localStorage.getItem(LEAD_KEY) === "en" ? "en" : "de";
  } catch {
    return "de";
  }
}

export function saveLead(lead: Lang): void {
  try {
    localStorage.setItem(LEAD_KEY, lead);
  } catch {
    // Nothing we can do; the choice holds for this session.
  }
}

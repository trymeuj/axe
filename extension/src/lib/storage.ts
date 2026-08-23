import type { Creator } from "./api";

const KEY_MY_USERNAME = "axe_my_username";
const KEY_TRACKED_CREATORS = "axe_tracked_creators";

export function getMyUsername(): string {
  try {
    return localStorage.getItem(KEY_MY_USERNAME) ?? "";
  } catch {
    return "";
  }
}

export function setMyUsername(username: string): void {
  localStorage.setItem(KEY_MY_USERNAME, username.replace("@", "").trim());
}

export function getTrackedCreators(): Creator[] {
  try {
    const raw = localStorage.getItem(KEY_TRACKED_CREATORS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Creator[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setTrackedCreators(creators: Creator[]): void {
  localStorage.setItem(KEY_TRACKED_CREATORS, JSON.stringify(creators.slice(0, 5)));
}

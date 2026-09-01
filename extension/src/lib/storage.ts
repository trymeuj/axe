import type { CombinedDiscovery, Creator } from "./api";

const KEY_MY_USERNAME = "axe_my_username";
const KEY_TRACKED_CREATORS = "axe_tracked_creators";
const KEY_DISCOVERY = "axe_combined_discovery_v2";

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
  localStorage.setItem(KEY_TRACKED_CREATORS, JSON.stringify(creators));
}

export function getCombinedDiscovery(): CombinedDiscovery | null {
  try {
    const raw = localStorage.getItem(KEY_DISCOVERY);
    return raw ? JSON.parse(raw) as CombinedDiscovery : null;
  } catch {
    return null;
  }
}

export function setCombinedDiscovery(discovery: CombinedDiscovery): void {
  localStorage.setItem(KEY_DISCOVERY, JSON.stringify(discovery));
}

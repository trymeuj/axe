import type { ExtensionAccess } from "./api";

const EXTENSION_TOKEN_KEY = "axe_extension_session";
const EXTENSION_ACCESS_CACHE_KEY = "axe_extension_access_cache";
const ACCESS_CACHE_LIFETIME_MS = 24 * 60 * 60 * 1000;

type AccessCache = {
  access: ExtensionAccess;
  checkedAt: number;
};

export async function getExtensionToken(): Promise<string | null> {
  const stored = await chrome.storage.local.get(EXTENSION_TOKEN_KEY);
  return typeof stored[EXTENSION_TOKEN_KEY] === "string" ? stored[EXTENSION_TOKEN_KEY] : null;
}

export async function setExtensionToken(token: string): Promise<void> {
  await chrome.storage.local.set({ [EXTENSION_TOKEN_KEY]: token });
}

export async function getCachedExtensionAccess(): Promise<ExtensionAccess | null> {
  const stored = await chrome.storage.local.get(EXTENSION_ACCESS_CACHE_KEY);
  const cache = stored[EXTENSION_ACCESS_CACHE_KEY] as AccessCache | undefined;
  if (!cache?.access || typeof cache.checkedAt !== "number") return null;
  if (Date.now() - cache.checkedAt >= ACCESS_CACHE_LIFETIME_MS) {
    await chrome.storage.local.remove(EXTENSION_ACCESS_CACHE_KEY);
    return null;
  }
  return cache.access;
}

export async function setCachedExtensionAccess(access: ExtensionAccess): Promise<void> {
  const cache: AccessCache = { access, checkedAt: Date.now() };
  await chrome.storage.local.set({ [EXTENSION_ACCESS_CACHE_KEY]: cache });
}

export async function clearCachedExtensionAccess(): Promise<void> {
  await chrome.storage.local.remove(EXTENSION_ACCESS_CACHE_KEY);
}

export async function clearExtensionToken(): Promise<void> {
  await chrome.storage.local.remove([EXTENSION_TOKEN_KEY, EXTENSION_ACCESS_CACHE_KEY]);
}

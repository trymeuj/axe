const EXTENSION_TOKEN_KEY = "axe_extension_session";

export async function getExtensionToken(): Promise<string | null> {
  const stored = await chrome.storage.local.get(EXTENSION_TOKEN_KEY);
  return typeof stored[EXTENSION_TOKEN_KEY] === "string" ? stored[EXTENSION_TOKEN_KEY] : null;
}

export async function setExtensionToken(token: string): Promise<void> {
  await chrome.storage.local.set({ [EXTENSION_TOKEN_KEY]: token });
}

export async function clearExtensionToken(): Promise<void> {
  await chrome.storage.local.remove(EXTENSION_TOKEN_KEY);
}

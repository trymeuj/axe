/**
 * X OAuth is intentionally disabled for the public-account MVP.
 *
 * Legacy authenticated API routes still import `auth` while they are being
 * retired or migrated. Returning no session keeps those routes closed without
 * initializing NextAuth, storing X tokens, or requesting authorization.
 */
export type DisabledSession = {
  user?: {
    id?: string;
  };
};

export async function auth(): Promise<DisabledSession | null> {
  return null;
}

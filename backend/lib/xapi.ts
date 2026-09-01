import { get as httpsGet } from "node:https";

const BASE_HOST = "api.twitterapi.io";

function apiHeaders() {
  return {
    "x-api-key": process.env.TWITTERAPI_IO_KEY!,
    "Content-Type": "application/json",
  };
}

// Use node:https directly to bypass Next.js's patched global fetch,
// which causes connection timeouts with external APIs in dev/Turbopack mode.
function get<T>(path: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const req = httpsGet(
      { hostname: BASE_HOST, path, headers: apiHeaders() },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => { raw += chunk; });
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`twitterapi.io error: ${res.statusCode} ${raw}`));
            return;
          }
          try { resolve(JSON.parse(raw) as T); } catch (e) { reject(e); }
        });
      }
    );
    req.on("error", reject);
  });
}

// ---- Types ----

export type XUserInfo = {
  id: string;
  userName: string;
  name: string;
  profilePicture: string;
  followers: number;
  following: number;
  statusesCount: number;
  description: string;
  createdAt: string;
};

export type XTweet = {
  id: string;
  text: string;
  likeCount: number;
  replyCount: number;
  retweetCount: number;
  quoteCount: number;
  viewCount: number;
  bookmarkCount: number;
  createdAt: string;
  isReply: boolean;
  retweeted_tweet?: unknown;
  url: string;
};

export type XUserSearchResult = XUserInfo & {
  isBlueVerified?: boolean;
  verifiedType?: string;
};

type XUserSearchRaw = Partial<XUserSearchResult> & {
  screen_name?: string;
  profile_image_url_https?: string;
  followers_count?: number;
  following_count?: number;
  statuses_count?: number;
  created_at?: string;
};

// ---- User info ----

export async function fetchUserByUsername(username: string): Promise<XUserInfo | null> {
  const data = await get<{ data: XUserInfo; status: string }>(`/twitter/user/info?userName=${username}`);
  if (data.status !== "success" || !data.data) return null;
  return data.data;
}

// ---- User search ----

export async function searchUsers(query: string): Promise<XUserSearchResult[]> {
  const data = await get<{
    users?: XUserSearchRaw[];
    status?: string;
  }>(`/twitter/user/search?query=${encodeURIComponent(query)}`);

  if (!Array.isArray(data.users)) return [];
  return data.users
    .map((user) => ({
      id: user.id ?? "",
      userName: user.userName ?? user.screen_name ?? "",
      name: user.name ?? user.screen_name ?? "",
      profilePicture: user.profilePicture ?? user.profile_image_url_https ?? "",
      followers: user.followers ?? user.followers_count ?? 0,
      following: user.following ?? user.following_count ?? 0,
      statusesCount: user.statusesCount ?? user.statuses_count ?? 0,
      description: user.description ?? "",
      createdAt: user.createdAt ?? user.created_at ?? "",
      isBlueVerified: user.isBlueVerified,
      verifiedType: user.verifiedType,
    }))
    .filter((user) => user.id && user.userName)
    .slice(0, 8);
}

// ---- User tweets: use tweet_timeline (userId) — recommended by twitterapi.io ----

export async function fetchUserTweets(
  usernameOrUserId: string,
  maxResults = 100
): Promise<XTweet[]> {
  // Resolve userId: if numeric, treat as userId; else fetch user to get id
  let userId = usernameOrUserId;
  if (isNaN(Number(usernameOrUserId))) {
    const user = await fetchUserByUsername(usernameOrUserId.replace("@", ""));
    if (!user) return [];
    userId = user.id;
  }

  const out: XTweet[] = [];
  let cursor = "";

  while (out.length < maxResults) {
    const url = `/twitter/user/tweet_timeline?userId=${userId}&includeReplies=false${cursor ? `&cursor=${cursor}` : ""}`;
    const data = await get<{
      data?: { tweets?: XTweet[] };
      has_next_page?: boolean;
      next_cursor?: string;
      status: string;
      message?: string;
    }>(url);

    if (data.status !== "success" || !data.data?.tweets?.length) break;

    out.push(...data.data.tweets);
    if (!data.has_next_page || !data.next_cursor) break;
    cursor = data.next_cursor;
  }

  return out.slice(0, maxResults);
}

// ---- Own account stats ----

export async function fetchOwnStats(username: string): Promise<{
  user: XUserInfo | null;
  recentTweets: XTweet[];
}> {
  const user = await fetchUserByUsername(username.replace("@", ""));
  if (!user) return { user: null, recentTweets: [] };

  const tweetsData = await get<{ data?: { tweets?: XTweet[] }; status: string }>(
    `/twitter/user/tweet_timeline?userId=${user.id}&includeReplies=false`
  );

  return {
    user,
    recentTweets: tweetsData.status === "success" ? (tweetsData.data?.tweets ?? []) : [],
  };
}

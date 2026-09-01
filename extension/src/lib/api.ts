const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error ?? "Request failed");
  }

  return res.json();
}

export type MeResponse = {
  username: string;
  displayName: string;
  profileImage: string;
  followersCount: number;
  followingCount: number;
  tweetCount: number;
  recentTweets: Array<{
    id: string;
    text: string;
    likes: number;
    replies: number;
    retweets: number;
    createdAt: string;
  }>;
  avgEngagement: number;
};

export type Creator = {
  userId?: string;
  creatorXId: string;
  creatorUsername: string;
  creatorDisplayName: string;
  creatorProfileImage: string | null;
  creatorFollowersCount: number;
  insight: CreatorInsight | null;
  recentTopics?: RecentTopics;
  paused?: boolean;
};

export type RecentTopics = {
  topics: Array<{
    title: string;
    miniPost: string;
    sourcePostId?: string;
    worthReplying?: boolean;
    replyDirections?: Array<{
      direction: string;
      examplePost: string;
    }>;
  }>;
  postCount: number;
  from: string;
  to: string;
};

export type CombinedPost = RecentTopics["topics"][number] & {
  creatorUsername: string;
};

export type CombinedDiscovery = {
  posts: CombinedPost[];
  candidateCount: number;
  creatorCount: number;
  failedCreators: string[];
  refreshedAt: string;
};

export type CreatorSearchResult = {
  id: string;
  username: string;
  displayName: string;
  profileImage: string | null;
  followersCount: number;
  verified: boolean;
};

export type CreatorInsight = {
  id?: string;
  creatorXId?: string;
  topics: string[];
  patterns: string[];
  postingFrequency: string;
  summary: string;
  topTweets: Array<{
    id: string;
    text: string;
    likeCount: number;
    replyCount: number;
    tweetedAt: string;
  }>;
  generatedAt?: string;
};

export type ReplyIdea = {
  angle: string;
  exampleReply: string;
  why: string;
};

// Auth-less (v0) API — used by extension
export const api = {
  discoverPosts: (usernames: string[]) =>
    apiFetch<CombinedDiscovery>("/api/v0/posts/discover", {
      method: "POST",
      body: JSON.stringify({ usernames }),
    }),

  searchCreators: (query: string) =>
    apiFetch<{ users: CreatorSearchResult[] }>(
      `/api/v0/creator/search?q=${encodeURIComponent(query.replace("@", ""))}`
    ),

  getUserStats: (username: string) =>
    apiFetch<MeResponse>(`/api/v0/user/stats?username=${encodeURIComponent(username.replace("@", ""))}`),

  getCreatorProfile: (username: string) =>
    apiFetch<{ creator: Omit<Creator, "insight" | "userId">; insight: null }>(
      `/api/v0/creator/insights?username=${encodeURIComponent(username.replace("@", ""))}&profileOnly=true`
    ),

  getCreatorInsights: (username: string) =>
    apiFetch<{ creator: Omit<Creator, "insight" | "userId">; insight: CreatorInsight | null }>(
      `/api/v0/creator/insights?username=${encodeURIComponent(username.replace("@", ""))}`
    ),

  getRecentTopics: (username: string) =>
    apiFetch<RecentTopics & { username: string }>(
      `/api/v0/creator/topics?username=${encodeURIComponent(username.replace("@", ""))}`
    ),

  getReplyIdeas: (
    tweetText: string,
    creatorUsername: string,
    userFollowerCount?: number
  ) =>
    apiFetch<{ ideas: ReplyIdea[] }>("/api/v0/reply-ideas", {
      method: "POST",
      body: JSON.stringify({
        tweetText,
        creatorUsername: creatorUsername.replace("@", ""),
        userFollowerCount: userFollowerCount ?? 0,
      }),
    }),
};

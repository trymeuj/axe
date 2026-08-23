// Utilities for reading context from the current X page

export type TweetPageContext = {
  tweetId: string;
  tweetText: string;
  authorUsername: string;
} | null;

export function getCurrentTweetContext(): TweetPageContext {
  // Match URLs like x.com/username/status/12345
  const match = window.location.pathname.match(
    /^\/([^/]+)\/status\/(\d+)/
  );
  if (!match) return null;

  const authorUsername = match[1];
  const tweetId = match[2];

  // Try to read tweet text from the DOM
  const articleEl = document.querySelector(
    `article[data-testid="tweet"] [data-testid="tweetText"]`
  );
  const tweetText = articleEl?.textContent ?? "";

  if (!tweetText) return null;

  return { tweetId, tweetText, authorUsername };
}

export function isOnTweetPage(): boolean {
  return /^\/[^/]+\/status\/\d+/.test(window.location.pathname);
}

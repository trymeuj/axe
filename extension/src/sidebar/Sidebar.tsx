import { useEffect, useState } from "react";
import {
  api,
  type CombinedDiscovery,
  type CombinedPost,
  type Creator,
  type CreatorSearchResult,
} from "../lib/api";
import {
  getCombinedDiscovery,
  getTrackedCreators,
  setCombinedDiscovery,
  setTrackedCreators,
} from "../lib/storage";

type Tab = "posts" | "creators";
type IdeaSelection = { creator: Creator; topic: CombinedPost };

const ACTIVE_IDEA_KEY = "axe_active_idea";
const POSTS_SCROLL_KEY = "axe_posts_scroll";
const REFRESH_COOLDOWN_MS = 8 * 60 * 60 * 1000;

function getSavedIdea(): IdeaSelection | null {
  try {
    const saved = localStorage.getItem(ACTIVE_IDEA_KEY);
    return saved ? JSON.parse(saved) as IdeaSelection : null;
  } catch {
    return null;
  }
}

export default function Sidebar() {
  const [tab, setTab] = useState<Tab>("posts");
  const [creators, setCreators] = useState<Creator[]>(getTrackedCreators);
  const [discovery, setDiscovery] = useState<CombinedDiscovery | null>(getCombinedDiscovery);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState("");
  const [selectedIdea, setSelectedIdea] = useState<IdeaSelection | null>(getSavedIdea);

  useEffect(() => setTrackedCreators(creators), [creators]);

  const selectIdea = (creator: Creator, topic: CombinedPost) => {
    const selection = { creator, topic };
    localStorage.setItem(POSTS_SCROLL_KEY, String(window.scrollY));
    localStorage.setItem(ACTIVE_IDEA_KEY, JSON.stringify(selection));
    setSelectedIdea(selection);
  };

  const closeIdea = () => {
    localStorage.removeItem(ACTIVE_IDEA_KEY);
    setSelectedIdea(null);
    setTab("posts");
    window.setTimeout(() => {
      const savedPosition = Number(localStorage.getItem(POSTS_SCROLL_KEY) ?? 0);
      window.scrollTo({ top: savedPosition, behavior: "instant" });
    }, 0);
  };

  const switchTab = (nextTab: Tab) => {
    if (selectedIdea) localStorage.removeItem(ACTIVE_IDEA_KEY);
    setSelectedIdea(null);
    setTab(nextTab);
  };

  const refreshPosts = async () => {
    if (refreshing || creators.length === 0) return;
    if (discovery && Date.now() < new Date(discovery.refreshedAt).getTime() + REFRESH_COOLDOWN_MS) return;

    setRefreshing(true);
    setRefreshError("");
    try {
      const result = await api.discoverPosts(creators.map((creator) => creator.creatorUsername));
      setDiscovery(result);
      setCombinedDiscovery(result);
    } catch (error) {
      setRefreshError(error instanceof Error ? error.message : "Could not find posts right now.");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="axe-shell">
      <header className="axe-header">
        {selectedIdea ? (
          <div className="axe-slate-header">
            <button onClick={closeIdea} aria-label="Back to posts"><BackIcon /></button>
            <h1>Idea slate</h1>
          </div>
        ) : (
          <>
            <div className="axe-brand-row">
              <div className="axe-brand">
                <div className="axe-logo"><span>A</span></div>
                <p className="axe-name">Axe</p>
              </div>
            </div>
          <nav className="axe-tabs axe-product-tabs" aria-label="Axe sections">
            <button className={tab === "posts" ? "active" : ""} onClick={() => switchTab("posts")}>Posts</button>
            <button className={tab === "creators" ? "active" : ""} onClick={() => switchTab("creators")}>Creators</button>
            <span className={`axe-tab-indicator ${tab === "creators" ? "right" : ""}`} />
          </nav>
          </>
        )}
      </header>

      <main className="axe-main">
        {selectedIdea ? (
          <IdeaSlate selection={selectedIdea} />
        ) : tab === "posts" ? (
          <PostsView
            creators={creators}
            discovery={discovery}
            refreshing={refreshing}
            error={refreshError}
            onRefresh={refreshPosts}
            onOpenCreators={() => switchTab("creators")}
            onSelectIdea={selectIdea}
          />
        ) : (
          <CreatorsView
            creators={creators}
            onCreatorsChange={setCreators}
          />
        )}
      </main>
    </div>
  );
}

function PostsView({
  creators,
  discovery,
  refreshing,
  error,
  onRefresh,
  onOpenCreators,
  onSelectIdea,
}: {
  creators: Creator[];
  discovery: CombinedDiscovery | null;
  refreshing: boolean;
  error: string;
  onRefresh: () => void;
  onOpenCreators: () => void;
  onSelectIdea: (creator: Creator, topic: CombinedPost) => void;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => setNow(Date.now()), 0);
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, []);

  const refreshedAt = discovery ? new Date(discovery.refreshedAt).getTime() : 0;
  const remainingMs = now === null
    ? REFRESH_COOLDOWN_MS
    : Math.max(0, refreshedAt + REFRESH_COOLDOWN_MS - now);
  const coolingDown = discovery !== null && (now === null || remainingMs > 0);

  if (creators.length === 0) {
    return (
      <div className="axe-view axe-fade-in">
        <section className="axe-intro solo">
          <div><h1>Your daily reply feed</h1><p>Add creators first, then Axe will find the strongest recent posts across all of them.</p></div>
        </section>
        <section className="axe-empty compact">
          <h2>No creators yet</h2>
          <p>Build your list before finding posts.</p>
          <button className="axe-secondary-button" onClick={onOpenCreators}>Add creators</button>
        </section>
      </div>
    );
  }

  return (
    <div className="axe-view axe-fade-in">
      <section className="axe-posts-hero">
        <div>
          <h1>Find something worth replying to</h1>
          <p>Axe checks {creators.length} {creators.length === 1 ? "creator" : "creators"} and ranks the strongest recent opportunities.</p>
        </div>
        {!coolingDown && (
          <button className="axe-discover-button" onClick={onRefresh} disabled={refreshing}>
            {refreshing ? <><MiniSpinner /> Finding posts</> : <><RefreshIcon /> Find posts for me</>}
          </button>
        )}
        {discovery && (
          <div className="axe-refresh-meta">
            <span>Last refreshed {formatRefreshDate(discovery.refreshedAt)}</span>
            {coolingDown && <span>Available again in {formatRemaining(remainingMs)}</span>}
            {discovery.failedCreators.length > 0 && <span>{discovery.failedCreators.length} failed</span>}
          </div>
        )}
        {error && <p className="axe-card-error">{error}</p>}
      </section>

      {refreshing ? (
        <TopicLoading />
      ) : discovery?.posts.length ? (
        <section className="axe-combined-feed">
          <div className="axe-feed-heading">
            <p>Top opportunities</p>
            <span>{discovery.posts.length} of {discovery.candidateCount}</span>
          </div>
          <div className="axe-topic-list axe-feed-list">
            {discovery.posts.map((post, index) => {
              const creator = creators.find(
                (item) => item.creatorUsername.toLowerCase() === post.creatorUsername.toLowerCase()
              ) ?? fallbackCreator(post.creatorUsername);
              return (
                <InspirationCard
                  key={`${post.sourcePostId}-${index}`}
                  topic={post}
                  creator={creator}
                  onSelect={() => onSelectIdea(creator, post)}
                />
              );
            })}
          </div>
        </section>
      ) : discovery ? (
        <section className="axe-empty compact">
          <h2>No recent reply opportunities</h2>
          <p>None of your creators posted an eligible opportunity in the last 48 hours.</p>
        </section>
      ) : (
        <section className="axe-empty compact">
          <h2>Your feed is ready to build</h2>
          <p>Run the first analysis to find recent posts across all your creators.</p>
        </section>
      )}
    </div>
  );
}

function InspirationCard({ topic, creator, onSelect }: {
  topic: CombinedPost;
  creator: Creator;
  onSelect: () => void;
}) {
  const isHot = topic.worthReplying === true;
  const sourceUrl = `https://x.com/${topic.creatorUsername}/status/${topic.sourcePostId}`;
  const openIdeaAndSource = () => {
    onSelect();
    window.open(sourceUrl, "_top");
  };

  return (
    <div
      className="axe-topic axe-feed-card"
      role="button"
      tabIndex={0}
      onClick={openIdeaAndSource}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") openIdeaAndSource();
      }}
    >
      <Avatar src={creator.creatorProfileImage} name={creator.creatorDisplayName} size={42} />
      <div className="axe-feed-card-body">
        <div className="axe-topic-heading">
          <div className="axe-post-author">
            <strong>{creator.creatorDisplayName}</strong>
            <span>@{topic.creatorUsername}</span>
          </div>
          {isHot && <span className="axe-reply-badge hot">Hot</span>}
        </div>
        <p className="axe-topic-title">{topic.title}</p>
        <p className="axe-mini-post">{topic.miniPost}</p>
        <a
          className="axe-post-link axe-feed-source"
          href={sourceUrl}
          target="_top"
          onClick={(event) => {
            event.stopPropagation();
            onSelect();
          }}
        >
          See post <ExternalLinkIcon />
        </a>
      </div>
    </div>
  );
}

function CreatorsView({ creators, onCreatorsChange }: {
  creators: Creator[];
  onCreatorsChange: (creators: Creator[]) => void;
}) {
  const [addUsername, setAddUsername] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [searchResults, setSearchResults] = useState<CreatorSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<string | null>(null);

  useEffect(() => {
    const query = addUsername.trim().replace("@", "");
    if (query.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchOpen(false);
      return;
    }
    let current = true;
    setSearchLoading(true);
    const timer = window.setTimeout(() => {
      api.searchCreators(query)
        .then(({ users }) => {
          if (!current) return;
          const tracked = new Set(creators.map((creator) => creator.creatorUsername.toLowerCase()));
          setSearchResults(users.filter((user) => !tracked.has(user.username.toLowerCase())).slice(0, 5));
          setSearchOpen(true);
        })
        .catch(() => current && setSearchResults([]))
        .finally(() => current && setSearchLoading(false));
    }, 350);
    return () => {
      current = false;
      window.clearTimeout(timer);
    };
  }, [addUsername, creators]);

  const addCreator = async (selectedUsername?: string) => {
    const username = (selectedUsername ?? addUsername).trim().replace("@", "");
    if (!username || addLoading) return;
    setAddLoading(true);
    setAddError("");
    setSearchOpen(false);
    try {
      const { creator } = await api.getCreatorProfile(username);
      if (creators.some((item) => item.creatorUsername.toLowerCase() === creator.creatorUsername.toLowerCase())) {
        setAddError("You’re already tracking this creator.");
        return;
      }
      onCreatorsChange([...creators, { ...creator, insight: null }]);
      setAddUsername("");
    } catch (error) {
      setAddError(error instanceof Error ? error.message : "Could not add this creator.");
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="axe-view axe-fade-in">
      <section className="axe-intro">
        <div>
          <h1>Creators</h1>
          <p>Add the people Axe should watch for reply opportunities.</p>
          <p className="axe-intro-note">You can always remove creators and add new ones, so don’t be shy. Get going.</p>
        </div>
        <span className="axe-count">{creators.length}</span>
      </section>

      <section className="axe-add-card">
        <div className="axe-input-wrap">
          <span className="axe-at">@</span>
          <input
            value={addUsername}
            onChange={(event) => { setAddUsername(event.target.value); setSearchOpen(true); }}
            onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setSearchOpen(false);
              if (event.key === "Enter") addCreator();
            }}
            placeholder="Add a creator"
            aria-label="Creator username"
            autoComplete="off"
          />
          {searchLoading && <span className="axe-search-spinner"><MiniSpinner /></span>}
          <button onClick={() => addCreator()} disabled={!addUsername.trim() || addLoading}>
            {addLoading ? <MiniSpinner /> : "Add"}
          </button>
        </div>
        {searchOpen && !addLoading && addUsername.trim().length >= 2 && (
          <div className="axe-search-results">
            {searchResults.length > 0 ? searchResults.map((user) => (
              <button key={user.id} className="axe-search-result" onClick={() => addCreator(user.username)}>
                <Avatar src={user.profileImage} name={user.displayName} size={40} />
                <span className="axe-search-identity">
                  <strong>{user.displayName}{user.verified && <VerifiedIcon />}</strong>
                  <small>@{user.username} · {formatNumber(user.followersCount)} followers</small>
                </span>
                <span className="axe-search-add">Add</span>
              </button>
            )) : !searchLoading ? (
              <div className="axe-search-empty">No accounts returned. Press Enter to try the exact username.</div>
            ) : null}
          </div>
        )}
        {addError && <p className="axe-error">{addError}</p>}
      </section>

      {creators.length === 0 ? <EmptyCreators /> : (
        <section className="axe-creator-list">
          {creators.map((creator, index) => (
            <article className="axe-creator-card axe-management-card" key={creator.creatorXId} style={{ animationDelay: `${index * 35}ms` }}>
              <div className="axe-creator-head">
                <Avatar src={creator.creatorProfileImage} name={creator.creatorDisplayName} size={44} />
                <div className="axe-creator-identity">
                  <p>{creator.creatorDisplayName}</p>
                  <span>@{creator.creatorUsername} · {formatNumber(creator.creatorFollowersCount)} followers</span>
                </div>
                {pendingRemoval === creator.creatorXId ? (
                  <div className="axe-remove-confirm" role="group" aria-label={`Remove ${creator.creatorDisplayName}?`}>
                    <button className="axe-remove-cancel" onClick={() => setPendingRemoval(null)}>Cancel</button>
                    <button
                      className="axe-remove-action"
                      onClick={() => {
                        onCreatorsChange(creators.filter((item) => item.creatorXId !== creator.creatorXId));
                        setPendingRemoval(null);
                      }}
                    >Remove</button>
                  </div>
                ) : (
                  <button
                    className="axe-icon-button"
                    onClick={() => setPendingRemoval(creator.creatorXId)}
                    title="Remove creator"
                    aria-label={`Remove ${creator.creatorDisplayName}`}
                  >×</button>
                )}
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

function IdeaSlate({ selection }: { selection: IdeaSelection }) {
  const { creator, topic } = selection;
  const replyDirections = topic.replyDirections ?? [];
  const draftKey = `axe_draft_${creator.creatorXId}_${topic.sourcePostId ?? topic.title}`;
  const [draft, setDraft] = useState(() => localStorage.getItem(draftKey) ?? "");
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  useEffect(() => localStorage.setItem(draftKey, draft), [draft, draftKey]);

  const copyDraft = async () => {
    if (!draft.trim()) return;
    setCopyFailed(false);
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      const fallback = document.createElement("textarea");
      fallback.value = draft;
      fallback.style.position = "fixed";
      fallback.style.opacity = "0";
      document.body.appendChild(fallback);
      fallback.focus();
      fallback.select();
      const succeeded = document.execCommand("copy");
      fallback.remove();
      if (succeeded) {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      } else setCopyFailed(true);
    }
  };

  return (
    <div className="axe-view axe-idea-slate axe-fade-in">
      <section className="axe-slate-source axe-source-post">
        <Avatar src={creator.creatorProfileImage} name={creator.creatorDisplayName} size={42} />
        <div className="axe-source-post-body">
          <div className="axe-slate-creator">
            <div><p>{creator.creatorDisplayName}</p><span>@{topic.creatorUsername}</span></div>
            {topic.worthReplying && <span className="axe-reply-badge hot">Hot</span>}
          </div>
          <h1>{topic.title}</h1>
          <p>{topic.miniPost}</p>
          <a href={`https://x.com/${topic.creatorUsername}/status/${topic.sourcePostId}`} target="_top">
            View original <ExternalLinkIcon />
          </a>
        </div>
      </section>
      {replyDirections.length > 0 && (
        <section className="axe-directions-box">
          <div className="axe-slate-label"><DirectionIcon /> Ways you could jump in</div>
          <div className="axe-direction-list">
            {replyDirections.map((item, index) => (
              <div className="axe-direction" key={`${item.direction}-${index}`}>
                <span className="axe-note-bullet" />
                <p><strong>{item.direction}</strong><span> something like “{item.examplePost}”</span></p>
              </div>
            ))}
          </div>
        </section>
      )}
      <section className="axe-draft-box">
        <div className="axe-draft-head"><p>Post your reply</p><span>{draft.length}</span></div>
        <textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Start writing your take..." autoFocus />
        <div className="axe-draft-footer">
          <span>{draft ? "Draft saved" : "Saved automatically"}</span>
          <button className={copied ? "copied" : ""} onClick={copyDraft} disabled={!draft.trim()}>
            <CopyIcon /> {copyFailed ? "Copy failed" : copied ? "Copied" : "Copy post"}
          </button>
        </div>
      </section>
    </div>
  );
}

function TopicLoading() {
  return (
    <div className="axe-loading-panel axe-combined-loading">
      <div className="axe-loading-copy">
        <MiniSpinner />
        <div><p>Scroll for 30 seconds, I’m on it.</p><span>Checking all your creators</span></div>
      </div>
      {[72, 92, 81].map((width, index) => (
        <div className="axe-skeleton" key={index}><i /><div><span style={{ width: `${width}%` }} /><span style={{ width: `${Math.max(48, width - 18)}%` }} /></div></div>
      ))}
    </div>
  );
}

function EmptyCreators() {
  return (
    <section className="axe-empty">
      <PeopleIcon />
      <h2>Add your first creator</h2><p>Add someone you always stop scrolling for.</p>
    </section>
  );
}

function Avatar({ src, name, size }: { src: string | null; name: string; size: number }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <div className="axe-avatar fallback" style={{ width: size, height: size }}>{name.charAt(0).toUpperCase()}</div>;
  return <img className="axe-avatar" src={src} alt="" style={{ width: size, height: size }} onError={() => setFailed(true)} />;
}

function fallbackCreator(username: string): Creator {
  return {
    creatorXId: username,
    creatorUsername: username,
    creatorDisplayName: `@${username}`,
    creatorProfileImage: null,
    creatorFollowersCount: 0,
    insight: null,
  };
}

function MiniSpinner() { return <span className="axe-mini-spinner" />; }
function RefreshIcon() { return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16.5 6.5V2.8m0 0h-3.7m3.7 0-2.1 2.1A6.4 6.4 0 1 0 16 12.7" /></svg>; }
function VerifiedIcon() { return <svg className="axe-verified" viewBox="0 0 22 22" aria-label="Verified"><path d="M20.4 11c0 1.2-1.5 2.1-1.9 3.1-.4 1.1.2 2.7-.6 3.5-.8.8-2.4.2-3.5.6-1 .4-1.9 1.9-3.1 1.9s-2.1-1.5-3.1-1.9c-1.1-.4-2.7.2-3.5-.6-.8-.8-.2-2.4-.6-3.5C3.5 13.1 2 12.2 2 11s1.5-2.1 1.9-3.1c.4-1.1-.2-2.7.6-3.5.8-.8 2.4-.2 3.5-.6C9 3.4 9.9 1.9 11.1 1.9s2.1 1.5 3.1 1.9c1.1.4 2.7.2 3.5.6.8.8.2 2.4.6 3.5.4 1 1.9 1.9 1.9 3.1Z" /><path className="axe-verified-check" d="m7.3 11.2 2.3 2.3 5.2-5.2" /></svg>; }
function PeopleIcon() { return <svg className="axe-empty-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-4A4.5 4.5 0 0 0 3 18.5V20M9.5 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-1a3 3 0 0 1 0 6m1.5 5v-1a4 4 0 0 0-2.4-3.7" /></svg>; }
function ExternalLinkIcon() { return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5H3.8a1.3 1.3 0 0 0-1.3 1.3v7.4a1.3 1.3 0 0 0 1.3 1.3h7.4a1.3 1.3 0 0 0 1.3-1.3V10M9 2.5h4.5V7M13.2 2.8 7.5 8.5" /></svg>; }
function BackIcon() { return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m9.8 3.2-4.7 4.8 4.7 4.8M5.4 8h7.1" /></svg>; }
function CopyIcon() { return <svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5.5" y="5.5" width="7.5" height="7.5" rx="1.5" /><path d="M10.5 5.5v-1A1.5 1.5 0 0 0 9 3H4.5A1.5 1.5 0 0 0 3 4.5V9A1.5 1.5 0 0 0 4.5 10.5h1" /></svg>; }
function DirectionIcon() { return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 4.2h7.5M3 8h10M3 11.8h6" /></svg>; }

function formatNumber(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function formatRemaining(milliseconds: number) {
  const totalMinutes = Math.ceil(milliseconds / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function formatRefreshDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

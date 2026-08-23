import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { api, type Creator, type MeResponse, type ReplyIdea } from "../lib/api";
import { getMyUsername, setMyUsername, getTrackedCreators, setTrackedCreators } from "../lib/storage";
import { getCurrentTweetContext, isOnTweetPage } from "../lib/twitter";

type View = "home" | "creator" | "me";

export default function Sidebar() {
  const [view, setView] = useState<View>("home");
  const [me, setMe] = useState<MeResponse | null>(null);
  const [meLoading, setMeLoading] = useState(false);
  const [creators, setCreators] = useState<Creator[]>(() => getTrackedCreators());
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [replyIdeas, setReplyIdeas] = useState<ReplyIdea[]>([]);
  const [replyLoading, setReplyLoading] = useState(false);
  const [addUsername, setAddUsername] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [myUsername, setMyUsernameState] = useState(() => getMyUsername());

  useEffect(() => { setTrackedCreators(creators); }, [creators]);

  useEffect(() => {
    if (!myUsername.trim()) { setMe(null); return; }
    setMeLoading(true);
    api.getUserStats(myUsername)
      .then(setMe).catch(() => setMe(null)).finally(() => setMeLoading(false));
  }, [myUsername]);

  useEffect(() => {
    if (!creators.length) return;
    const check = () => {
      if (!isOnTweetPage()) { setReplyIdeas([]); return; }
      const ctx = getCurrentTweetContext();
      if (!ctx) return;
      const matched = creators.find(
        c => c.creatorUsername.toLowerCase() === ctx.authorUsername.toLowerCase()
      );
      if (!matched) return;
      setReplyLoading(true);
      api.getReplyIdeas(ctx.tweetText, ctx.authorUsername, me?.followersCount ?? 0)
        .then(res => setReplyIdeas(res.ideas))
        .catch(() => setReplyIdeas([]))
        .finally(() => setReplyLoading(false));
    };
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, [creators, me?.followersCount]);

  const handleAdd = async () => {
    if (!addUsername.trim()) return;
    setAddLoading(true);
    setAddError("");
    const username = addUsername.trim().replace("@", "");
    try {
      const { creator } = await api.getCreatorProfile(username);
      if (creators.some(c => c.creatorUsername.toLowerCase() === creator.creatorUsername.toLowerCase())) {
        setAddError("Already tracking this creator");
        setAddLoading(false);
        return;
      }
      if (creators.length >= 5) {
        setAddError("Max 5 creators");
        setAddLoading(false);
        return;
      }
      const newCreator: Creator = { ...creator, insight: null, paused: false };
      setCreators(prev => [...prev, newCreator]);
      setAddUsername("");
      setAddLoading(false);
      const added = creator.creatorUsername;
      api.getCreatorInsights(username)
        .then(({ insight }) => {
          setCreators(prev =>
            prev.map(c => c.creatorUsername.toLowerCase() === added.toLowerCase() ? { ...c, insight } : c)
          );
        }).catch(() => {});
    } catch (e: unknown) {
      setAddError(e instanceof Error ? e.message : "Failed to add creator");
      setAddLoading(false);
    }
  };

  const switchView = (v: View) => {
    setView(v);
    if (v === "me" && myUsername && !me && !meLoading) {
      setMeLoading(true);
      api.getUserStats(myUsername).then(setMe).catch(() => setMe(null)).finally(() => setMeLoading(false));
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-[#E7E9EA]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>

      {/* ── Header ── */}
      <header className="flex-shrink-0 border-b border-[#2F3336]">
        <div className="flex items-center justify-between px-4 pt-3.5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#1D9BF0] flex items-center justify-center flex-shrink-0">
              <span style={{ color: "#000", fontWeight: 900, fontSize: 13, lineHeight: 1 }}>A</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em", color: "#E7E9EA" }}>Axe</span>
          </div>
        </div>
        <nav className="flex px-0">
          {(["home", "me"] as const).map(v => (
            <button
              key={v}
              onClick={() => switchView(v)}
              className="flex-1 py-3 transition-colors"
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: view === v ? "#E7E9EA" : "#71767B",
                borderBottom: view === v ? "2px solid #1D9BF0" : "2px solid transparent",
                background: "none",
              }}
            >
              {v === "home" ? "Creators" : "Me"}
            </button>
          ))}
        </nav>
      </header>

      {/* ── Reply ideas strip ── */}
      {(replyLoading || replyIdeas.length > 0) && (
        <div className="flex-shrink-0 border-b border-[#2F3336]" style={{ background: "#0A0F14" }}>
          {replyLoading ? (
            <div className="flex items-center gap-2.5 px-4 py-3">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-[#2F3336] border-t-[#1D9BF0] animate-spin flex-shrink-0" />
              <span style={{ fontSize: 12, color: "#71767B" }}>Finding reply angles...</span>
            </div>
          ) : (
            <div className="px-4 py-3.5">
              <p style={{ fontSize: 10, fontWeight: 700, color: "#1D9BF0", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
                ⚡ Reply angles
              </p>
              <div className="flex flex-col gap-2.5">
                {replyIdeas.map((idea, i) => <ReplyCard key={i} idea={idea} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Main ── */}
      <div className="flex-1 overflow-y-auto">
        {view === "home" && (
          <HomeView
            creators={creators}
            addUsername={addUsername}
            setAddUsername={setAddUsername}
            addLoading={addLoading}
            addError={addError}
            onAdd={handleAdd}
            onSelect={c => { setSelectedCreator(c); setView("creator"); }}
            onUntrack={xId => setCreators(prev => prev.filter(c => c.creatorXId !== xId))}
            onPause={xId => setCreators(prev => prev.map(c => c.creatorXId === xId ? { ...c, paused: !c.paused } : c))}
          />
        )}
        {view === "creator" && selectedCreator && (
          <CreatorView
            creator={selectedCreator}
            onBack={() => setView("home")}
            onUntrack={() => { setCreators(prev => prev.filter(c => c.creatorXId !== selectedCreator.creatorXId)); setView("home"); }}
            onPause={() => {
              setCreators(prev => prev.map(c => c.creatorXId === selectedCreator.creatorXId ? { ...c, paused: !c.paused } : c));
              setSelectedCreator(prev => prev ? { ...prev, paused: !prev.paused } : null);
            }}
          />
        )}
        {view === "me" && (
          <MeView
            me={me}
            meLoading={meLoading}
            myUsername={myUsername}
            onUsernameChange={u => { setMyUsernameState(u); setMyUsername(u); }}
          />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Home View
// ─────────────────────────────────────────────────────────────────────────────

function HomeView({
  creators, addUsername, setAddUsername, addLoading, addError,
  onAdd, onSelect, onUntrack, onPause,
}: {
  creators: Creator[];
  addUsername: string;
  setAddUsername: (v: string) => void;
  addLoading: boolean;
  addError: string;
  onAdd: () => void;
  onSelect: (c: Creator) => void;
  onUntrack: (xId: string) => void;
  onPause: (xId: string) => void;
}) {
  return (
    <div>
      {/* Input row */}
      <div className="px-4 py-3 border-b border-[#2F3336]">
        <div className="flex gap-2">
          <input
            type="text"
            value={addUsername}
            onChange={e => setAddUsername(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onAdd()}
            placeholder="Add @username"
            style={{
              flex: 1,
              background: "#16181C",
              border: "1px solid #2F3336",
              borderRadius: 9999,
              padding: "8px 16px",
              fontSize: 13,
              color: "#E7E9EA",
              outline: "none",
            }}
            onFocus={e => (e.target.style.borderColor = "#1D9BF0")}
            onBlur={e => (e.target.style.borderColor = "#2F3336")}
          />
          <button
            onClick={onAdd}
            disabled={addLoading || !addUsername.trim()}
            style={{
              background: addLoading || !addUsername.trim() ? "#333" : "#E7E9EA",
              color: "#000",
              fontWeight: 700,
              fontSize: 13,
              borderRadius: 9999,
              padding: "8px 16px",
              cursor: addLoading || !addUsername.trim() ? "not-allowed" : "pointer",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 60,
              transition: "background 0.15s",
            }}
          >
            {addLoading ? <Spinner dark /> : "Track"}
          </button>
        </div>
        {addError && (
          <p style={{ color: "#F4212E", fontSize: 12, marginTop: 8 }}>{addError}</p>
        )}
      </div>

      {/* List */}
      {creators.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center" style={{ padding: "48px 24px" }}>
          <div style={{ width: 48, height: 48, borderRadius: 9999, background: "#16181C", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, fontSize: 22 }}>
            👤
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#E7E9EA", marginBottom: 6 }}>No creators yet</p>
          <p style={{ fontSize: 13, color: "#71767B", lineHeight: 1.5 }}>
            Track up to 5 creators to get AI insights on what makes them grow.
          </p>
        </div>
      ) : (
        creators.map(c => (
          <CreatorRow
            key={c.creatorXId}
            creator={c}
            onClick={() => onSelect(c)}
            onUntrack={() => onUntrack(c.creatorXId)}
            onPause={() => onPause(c.creatorXId)}
          />
        ))
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Creator Row
// ─────────────────────────────────────────────────────────────────────────────

function CreatorRow({ creator, onClick, onUntrack, onPause }: {
  creator: Creator;
  onClick: () => void;
  onUntrack: () => void;
  onPause: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        borderBottom: "1px solid #2F3336",
        background: hovered ? "#080808" : "transparent",
        cursor: "pointer",
        transition: "background 0.1s",
      }}
    >
      <Avatar src={creator.creatorProfileImage} size={42} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#E7E9EA", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.3 }}>
          {creator.creatorDisplayName}
        </p>
        <p style={{ fontSize: 12, color: "#71767B", marginTop: 1 }}>
          @{creator.creatorUsername}
        </p>
        {creator.insight?.topics?.length ? (
          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
            {creator.insight.topics.slice(0, 2).map((t, i) => (
              <span key={i} style={{
                background: "rgba(29,155,240,0.08)",
                color: "#1D9BF0",
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: 9999,
                lineHeight: 1.5,
              }}>
                {t}
              </span>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 11, color: "#71767B", marginTop: 4, display: "flex", alignItems: "center", gap: 5 }}>
            {creator.paused ? (
              <span style={{ color: "#F7931A" }}>Paused</span>
            ) : (
              <>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "#1D9BF0",
                  display: "inline-block",
                  animation: "pulse 1.5s ease-in-out infinite",
                }} />
                Analyzing...
              </>
            )}
          </p>
        )}
      </div>

      <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
        <ActionBtn
          onClick={e => { e.stopPropagation(); onPause(); }}
          title={creator.paused ? "Resume" : "Pause"}
          hoverColor="#1D9BF0"
          hoverBg="rgba(29,155,240,0.1)"
        >
          {creator.paused ? "▶" : "⏸"}
        </ActionBtn>
        <ActionBtn
          onClick={e => { e.stopPropagation(); onUntrack(); }}
          title="Untrack"
          hoverColor="#F4212E"
          hoverBg="rgba(244,33,46,0.1)"
        >
          ✕
        </ActionBtn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Creator Detail View
// ─────────────────────────────────────────────────────────────────────────────

function CreatorView({ creator, onBack, onUntrack, onPause }: {
  creator: Creator;
  onBack: () => void;
  onUntrack: () => void;
  onPause: () => void;
}) {
  const { insight } = creator;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid #2F3336" }}>
        <ActionBtn onClick={onBack} title="Back" hoverColor="#E7E9EA" hoverBg="#16181C" style={{ marginRight: 2 }}>
          ←
        </ActionBtn>
        <Avatar src={creator.creatorProfileImage} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#E7E9EA", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.3 }}>
            {creator.creatorDisplayName}
          </p>
          <p style={{ fontSize: 12, color: "#71767B" }}>
            @{creator.creatorUsername} · {fmtNum(creator.creatorFollowersCount)} followers
          </p>
        </div>
        <div style={{ display: "flex", gap: 2, alignItems: "center", flexShrink: 0 }}>
          {creator.paused && (
            <span style={{ fontSize: 10, color: "#F7931A", border: "1px solid rgba(247,147,26,0.4)", borderRadius: 9999, padding: "2px 8px", marginRight: 4 }}>
              Paused
            </span>
          )}
          <ActionBtn onClick={onPause} title={creator.paused ? "Resume" : "Pause"} hoverColor="#1D9BF0" hoverBg="rgba(29,155,240,0.1)">
            {creator.paused ? "▶" : "⏸"}
          </ActionBtn>
          <ActionBtn onClick={onUntrack} title="Untrack" hoverColor="#F4212E" hoverBg="rgba(244,33,46,0.1)">
            ✕
          </ActionBtn>
        </div>
      </div>

      {!insight ? (
        <div className="flex flex-col items-center justify-center text-center" style={{ padding: "56px 24px" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid #2F3336", borderTopColor: "#1D9BF0", marginBottom: 16, animation: "spin 0.8s linear infinite" }} />
          <p style={{ fontSize: 14, fontWeight: 700, color: "#E7E9EA", marginBottom: 6 }}>Analyzing tweets</p>
          <p style={{ fontSize: 13, color: "#71767B" }}>Usually takes about 30 seconds.</p>
        </div>
      ) : (
        <>
          <Section>
            <p style={{ fontSize: 13, color: "#E7E9EA", lineHeight: 1.6 }}>{insight.summary}</p>
          </Section>

          <Section label="Topics">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {insight.topics.map((t, i) => (
                <span key={i} style={{
                  background: "#16181C",
                  border: "1px solid #2F3336",
                  color: "#E7E9EA",
                  fontSize: 12,
                  padding: "4px 12px",
                  borderRadius: 9999,
                }}>
                  {t}
                </span>
              ))}
            </div>
          </Section>

          <Section label="What works">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {insight.patterns.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 10, fontSize: 13 }}>
                  <span style={{ color: "#1D9BF0", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>—</span>
                  <span style={{ color: "#E7E9EA", lineHeight: 1.5 }}>{p}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section label="Posting cadence">
            <p style={{ fontSize: 13, color: "#E7E9EA" }}>{insight.postingFrequency}</p>
          </Section>

          <Section label="Top tweets">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {insight.topTweets.map(t => (
                <TweetCard key={t.id} text={t.text} likes={t.likeCount} replies={t.replyCount} date={t.tweetedAt} />
              ))}
            </div>
          </Section>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Me View
// ─────────────────────────────────────────────────────────────────────────────

function MeView({ me, meLoading, myUsername, onUsernameChange }: {
  me: MeResponse | null;
  meLoading: boolean;
  myUsername: string;
  onUsernameChange: (v: string) => void;
}) {
  const [input, setInput] = useState(myUsername);

  if (!myUsername.trim()) {
    return (
      <div style={{ padding: "24px 16px" }}>
        <p style={{ fontSize: 17, fontWeight: 800, color: "#E7E9EA", marginBottom: 6 }}>Your profile</p>
        <p style={{ fontSize: 13, color: "#71767B", lineHeight: 1.5, marginBottom: 20 }}>
          Enter your username to see your stats and get personalized reply suggestions.
        </p>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && input.trim() && onUsernameChange(input.trim().replace("@", ""))}
          placeholder="@yourusername"
          style={{
            width: "100%",
            background: "#16181C",
            border: "1px solid #2F3336",
            borderRadius: 12,
            padding: "12px 16px",
            fontSize: 14,
            color: "#E7E9EA",
            outline: "none",
            marginBottom: 12,
            boxSizing: "border-box",
          }}
          onFocus={e => (e.target.style.borderColor = "#1D9BF0")}
          onBlur={e => (e.target.style.borderColor = "#2F3336")}
        />
        <button
          onClick={() => input.trim() && onUsernameChange(input.trim().replace("@", ""))}
          disabled={!input.trim()}
          style={{
            background: input.trim() ? "#E7E9EA" : "#333",
            color: "#000",
            fontWeight: 700,
            fontSize: 13,
            borderRadius: 9999,
            padding: "10px 20px",
            cursor: input.trim() ? "pointer" : "not-allowed",
          }}
        >
          Save
        </button>
      </div>
    );
  }

  if (meLoading || !me) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
        <div style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid #2F3336", borderTopColor: "#1D9BF0", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  return (
    <div>
      {/* Profile */}
      <div style={{ padding: "16px", borderBottom: "1px solid #2F3336" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
          <Avatar src={me.profileImage} size={52} />
          <button
            onClick={() => onUsernameChange("")}
            style={{
              fontSize: 12,
              color: "#71767B",
              border: "1px solid #2F3336",
              borderRadius: 9999,
              padding: "5px 14px",
              cursor: "pointer",
              background: "none",
              transition: "border-color 0.15s",
            }}
            onMouseEnter={e => ((e.target as HTMLElement).style.borderColor = "#71767B")}
            onMouseLeave={e => ((e.target as HTMLElement).style.borderColor = "#2F3336")}
          >
            Change
          </button>
        </div>
        <p style={{ fontSize: 16, fontWeight: 800, color: "#E7E9EA", lineHeight: 1.3 }}>{me.displayName}</p>
        <p style={{ fontSize: 13, color: "#71767B", marginTop: 2 }}>@{me.username}</p>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", borderBottom: "1px solid #2F3336" }}>
        <StatCell label="Followers" value={fmtNum(me.followersCount)} />
        <StatCell label="Following" value={fmtNum(me.followingCount)} />
        <StatCell label="Tweets" value={fmtNum(me.tweetCount)} />
      </div>

      {/* Avg engagement */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #2F3336" }}>
        <span style={{ fontSize: 13, color: "#71767B" }}>Avg engagement</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#E7E9EA" }}>{me.avgEngagement}</span>
      </div>

      {/* Recent tweets */}
      <Section label="Recent tweets">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {me.recentTweets.map(t => (
            <TweetCard key={t.id} text={t.text} likes={t.likes} replies={t.replies} retweets={t.retweets} />
          ))}
        </div>
      </Section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared Components
// ─────────────────────────────────────────────────────────────────────────────

function ReplyCard({ idea }: { idea: ReplyIdea }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{
      background: "rgba(29,155,240,0.06)",
      border: "1px solid rgba(29,155,240,0.18)",
      borderRadius: 12,
      padding: "10px 12px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 5 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#1D9BF0", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {idea.angle}
        </span>
        <button
          onClick={() => { navigator.clipboard.writeText(idea.exampleReply); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          style={{ fontSize: 11, color: copied ? "#1D9BF0" : "#71767B", cursor: "pointer", background: "none", flexShrink: 0, transition: "color 0.15s" }}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <p style={{ fontSize: 12, color: "#E7E9EA", lineHeight: 1.55, marginBottom: 5 }}>
        "{idea.exampleReply}"
      </p>
      <p style={{ fontSize: 11, color: "#71767B", lineHeight: 1.5 }}>{idea.why}</p>
    </div>
  );
}

function TweetCard({ text, likes, replies, retweets, date }: {
  text: string; likes: number; replies: number; retweets?: number; date?: string;
}) {
  return (
    <div style={{
      background: "#16181C",
      border: "1px solid #2F3336",
      borderRadius: 12,
      padding: "12px",
    }}>
      <p style={{ fontSize: 13, color: "#E7E9EA", lineHeight: 1.55, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {text}
      </p>
      <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#71767B", alignItems: "center" }}>
        <span>♥ {fmtNum(likes)}</span>
        <span>↩ {fmtNum(replies)}</span>
        {retweets !== undefined && <span>↺ {fmtNum(retweets)}</span>}
        {date && <span style={{ marginLeft: "auto" }}>{fmtDate(date)}</span>}
      </div>
    </div>
  );
}

function Section({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div style={{ padding: "16px", borderBottom: "1px solid #2F3336" }}>
      {label && (
        <p style={{ fontSize: 10, fontWeight: 700, color: "#71767B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
          {label}
        </p>
      )}
      {children}
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "12px 8px",
      borderRight: "1px solid #2F3336",
    }}
      className="last:border-r-0"
    >
      <span style={{ fontSize: 16, fontWeight: 800, color: "#E7E9EA" }}>{value}</span>
      <span style={{ fontSize: 11, color: "#71767B", marginTop: 2 }}>{label}</span>
    </div>
  );
}

function Avatar({ src, size }: { src: string | null; size: number }) {
  return (
    <img
      src={src ?? ""}
      alt=""
      style={{ width: size, height: size, borderRadius: "50%", background: "#2F3336", flexShrink: 0, objectFit: "cover", display: "block" }}
      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
    />
  );
}

function ActionBtn({ onClick, title, hoverColor, hoverBg, children, style: extraStyle }: {
  onClick: (e: React.MouseEvent) => void;
  title: string;
  hoverColor: string;
  hoverBg: string;
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 30,
        height: 30,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        color: hovered ? hoverColor : "#71767B",
        background: hovered ? hoverBg : "transparent",
        cursor: "pointer",
        transition: "color 0.15s, background 0.15s",
        ...extraStyle,
      }}
    >
      {children}
    </button>
  );
}

function Spinner({ dark }: { dark?: boolean }) {
  return (
    <div style={{
      width: 14, height: 14, borderRadius: "50%",
      border: `2px solid ${dark ? "rgba(0,0,0,0.2)" : "#2F3336"}`,
      borderTopColor: dark ? "#000" : "#1D9BF0",
      animation: "spin 0.8s linear infinite",
      display: "inline-block",
    }} />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function fmtDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const days = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "1d";
  if (days < 30) return `${days}d`;
  if (days < 365) return `${Math.floor(days / 30)}mo`;
  return `${Math.floor(days / 365)}y`;
}

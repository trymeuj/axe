import Link from "next/link";
import type { CSSProperties } from "react";
import { CHROME_WEB_STORE_URL } from "@/lib/links";
import ScrollCue from "./components/ScrollCue";

const JUSTIN_POST_URL =
  "https://x.com/thejustinwelsh/status/1551614033530437637";

function AxeMark() {
  return (
    <span className="axe-mark" aria-hidden="true">
      A
    </span>
  );
}

function VerifiedIcon() {
  return (
    <svg className="verified-icon" viewBox="0 0 22 22" aria-label="Verified account">
      <path d="M20.4 11c0 1.2-1.5 2.1-1.9 3.1-.4 1.1.2 2.7-.6 3.5-.8.8-2.4.2-3.5.6-1 .4-1.9 1.9-3.1 1.9s-2.1-1.5-3.1-1.9c-1.1-.4-2.7.2-3.5-.6-.8-.8-.2-2.4-.6-3.5C3.5 13.1 2 12.2 2 11s1.5-2.1 1.9-3.1c.4-1.1-.2-2.7.6-3.5.8-.8 2.4-.2 3.5-.6C9 3.4 9.9 1.9 11.1 1.9s2.1 1.5 3.1 1.9c1.1.4 2.7-.2 3.5.6.8.8.2 2.4.6 3.5.6 1 2.1 1.9 2.1 3.1Z" />
      <path className="verified-check" d="m7.3 11.2 2.3 2.3 5.2-5.2" />
    </svg>
  );
}

function ReplyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M1.8 11.5c0-4.7 4.1-8.5 9.6-8.5h1.2c5.5 0 9.6 3.8 9.6 8.5S18.1 20 12.6 20h-1.2c-.7 0-1.4-.1-2.1-.2L4.6 22c-.6.3-1.2-.3-1-.9l1.1-3.6a8 8 0 0 1-2.9-6Z" />
    </svg>
  );
}

function RepostIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m7 3 3 3-3 3M10 6H6.5A3.5 3.5 0 0 0 3 9.5V12m14 9-3-3 3-3m-3 3h3.5a3.5 3.5 0 0 0 3.5-3.5V12" />
    </svg>
  );
}

function LikeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s-8.8-5.3-8.8-12.1A4.9 4.9 0 0 1 12 5.8a4.9 4.9 0 0 1 8.8 3.1C20.8 15.7 12 21 12 21Z" />
    </svg>
  );
}

function ViewsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 19V9m5 10V5m6 14v-7m5 7V3" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3.5h12v17l-6-4-6 4v-17Z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 16V3m0 0L7.5 7.5M12 3l4.5 4.5M5 13v7h14v-7" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="5" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="19" cy="12" r="1.4" />
    </svg>
  );
}

function StoreArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M5.5 14.5 14.5 5.5M8 5.5h6.5V12" />
    </svg>
  );
}

function PostActions({ animated = false }: { animated?: boolean }) {
  return (
    <div className={`post-actions${animated ? " post-actions--animated" : ""}`}>
      <span className="post-action post-action--reply" aria-label="49 replies">
        <span className="post-action__icon"><ReplyIcon /></span>
        <span>49</span>
      </span>
      <span className="post-action post-action--repost" aria-label="38 reposts">
        <span className="post-action__icon"><RepostIcon /></span>
        <span>38</span>
      </span>
      <span className="post-action post-action--like" aria-label="533 likes">
        <span className="post-action__icon"><LikeIcon /></span>
        <span>533</span>
      </span>
      <span className="post-action post-action--views" aria-label="Post analytics">
        <span className="post-action__icon"><ViewsIcon /></span>
      </span>
      <span className="post-action post-action--bookmark" aria-label="Bookmark">
        <span className="post-action__icon"><BookmarkIcon /></span>
      </span>
      <span className="post-action post-action--share" aria-label="Share">
        <span className="post-action__icon"><ShareIcon /></span>
      </span>
    </div>
  );
}

function AxeIdentity({ label }: { label?: string }) {
  return (
    <div className="post-author post-author--axe">
      <AxeMark />
      <div className="post-author__identity">
        {label && <span className="post-context">{label}</span>}
        <div className="post-author__line">
          <strong>Axe</strong>
          <VerifiedIcon />
          <span>@useaxe</span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="x-landing" id="top">
      <header className="x-header">
        <div className="x-header__inner">
          <a className="x-brand" href="#top" aria-label="Axe home">
            <AxeMark />
            <span>Axe</span>
          </a>
          <nav className="x-header__nav" aria-label="Primary navigation">
            <a href="#how-it-works">How it works</a>
            <Link href="/privacy">Privacy</Link>
          </nav>
          <a
            className="x-header__cta"
            href={CHROME_WEB_STORE_URL}
            target="_blank"
            rel="noreferrer"
          >
            Add to Chrome
          </a>
        </div>
      </header>

      <section className="timeline-hero" aria-labelledby="hero-title">
        <div className="timeline-shell">
          <aside className="timeline-rail timeline-rail--left" aria-hidden="true">
            <div className="rail-item rail-item--active">
              <span className="rail-home" />
              <span>Home</span>
            </div>
            <div className="rail-item">
              <span className="rail-search" />
              <span>Explore</span>
            </div>
            <div className="rail-item">
              <span className="rail-bell" />
              <span>Notifications</span>
            </div>
          </aside>

          <div className="timeline-feed">
            <div className="feed-header">
              <strong>For you</strong>
              <span />
            </div>

            <div className="hero-posts">
              <article className="x-post x-post--original">
                <a
                  className="post-link-overlay"
                  href={JUSTIN_POST_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open Justin Welsh's original post on X"
                />
                <div className="post-author">
                  <img
                    className="post-avatar"
                    src="/avatars/justin-welsh.jpg"
                    alt="Justin Welsh"
                    width="52"
                    height="52"
                  />
                  <div className="post-author__identity">
                    <div className="post-author__line">
                      <strong>Justin Welsh</strong>
                      <VerifiedIcon />
                      <span>@thejustinwelsh · Jul 25, 2022</span>
                    </div>
                  </div>
                  <span className="post-more"><MoreIcon /></span>
                </div>

                <div className="post-body" id="hero-title">
                  <p>Twitter observation:</p>
                  <p>
                    Accounts growing crazy fast don&apos;t have the best content.
                  </p>
                  <p>They have:</p>
                  <ol>
                    <li>A clear profile: What are they doing? Why should you follow?</li>
                    <li>Helpful content: Educating their audience daily</li>
                    <li>Deep network: They engage regularly</li>
                  </ol>
                  <p>Nothing fancy.</p>
                  <p>All meaningful.</p>
                </div>

                <PostActions animated />
              </article>

              <div className="quote-connector" aria-hidden="true">
                <span />
                <span className="quote-connector__label">Quote</span>
              </div>

              <article className="x-post x-post--axe">
                <AxeIdentity label="Axe quoted" />
                <span className="post-more"><MoreIcon /></span>
                <div className="axe-statement">
                  <p>Showing up consistently is the hard part.</p>
                  <h1>Axe guarantees that.</h1>
                  <a
                    className="hero-install"
                    href={CHROME_WEB_STORE_URL}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>
                      Add Axe to Chrome
                      <small>Free on the Chrome Web Store</small>
                    </span>
                    <StoreArrowIcon />
                  </a>
                </div>
                <div className="post-actions post-actions--axe" aria-hidden="true">
                  <span className="post-action"><span className="post-action__icon"><ReplyIcon /></span></span>
                  <span className="post-action"><span className="post-action__icon"><RepostIcon /></span></span>
                  <span className="post-action"><span className="post-action__icon"><LikeIcon /></span></span>
                  <span className="post-action"><span className="post-action__icon"><BookmarkIcon /></span></span>
                  <span className="post-action"><span className="post-action__icon"><ShareIcon /></span></span>
                </div>
              </article>
            </div>
          </div>

          <aside className="timeline-rail timeline-rail--right">
            <div className="search-pill" aria-hidden="true">Search</div>
            <div className="rail-card">
              <span className="rail-card__eyebrow">Your weekly rhythm</span>
              <strong>35</strong>
              <p>meaningful replies</p>
              <span className="rail-card__status">
                <i /> 5 every day
              </span>
            </div>
          </aside>
        </div>

        <ScrollCue />
      </section>

      <section className="x-workflow" id="how-it-works" aria-labelledby="workflow-title">
        <div className="workflow-shell">
          <div className="workflow-metric">
            <span className="workflow-metric__eyebrow">A habit that compounds</span>
            <div className="workflow-metric__number" aria-hidden="true">
              <span>35</span>
            </div>
            <h2 id="workflow-title">replies per week</h2>
            <p>Five good conversations a day. No blank page.</p>
            <div className="week-dots" aria-label="Seven active days">
              {Array.from({ length: 7 }).map((_, index) => (
                <span key={index} style={{ "--dot": index } as CSSProperties} />
              ))}
            </div>
          </div>

          <div className="workflow-thread">
            <div className="thread-header">
              <div>
                <span>Thread</span>
                <strong>How Axe gets you replying</strong>
              </div>
              <MoreIcon />
            </div>

            <article className="thread-post thread-post--like">
              <AxeIdentity />
              <div className="thread-post__body">
                <p>Replying is the way to grow on X.</p>
                <span className="thread-action thread-action--like">
                  <span><LikeIcon /></span>
                  Like
                </span>
              </div>
            </article>

            <article className="thread-post thread-post--bookmark">
              <AxeIdentity />
              <div className="thread-post__body">
                <p>Track creators that inspire you.</p>
                <span className="thread-action thread-action--bookmark">
                  <span><BookmarkIcon /></span>
                  Bookmark
                </span>
              </div>
            </article>

            <article className="thread-post thread-post--repost">
              <AxeIdentity />
              <div className="thread-post__body">
                <p>Reply to their viral posts with Axe.</p>
                <span className="thread-action thread-action--green">
                  <span><RepostIcon /></span>
                  Repost
                </span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <footer className="x-footer">
        <div className="x-footer__main">
          <a className="x-brand" href="#top" aria-label="Axe home">
            <AxeMark />
            <span>Axe</span>
          </a>
          <p>
            Public X data only. Your drafts stay in your browser. Nothing is
            posted automatically.
          </p>
          <nav aria-label="Legal and support">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/support">Support</Link>
          </nav>
        </div>
        <div className="x-footer__meta">
          <span>© {new Date().getFullYear()} Axe</span>
          <a href="mailto:dev.ujjwal.mathur@gmail.com">
            dev.ujjwal.mathur@gmail.com
          </a>
        </div>
      </footer>
    </main>
  );
}

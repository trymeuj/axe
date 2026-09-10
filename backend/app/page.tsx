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

function XLogo({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
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
          <div className="x-header__actions">
            <Link className="x-header__signin" href="/auth/signin">
              Sign in
            </Link>
            <a
              className="x-header__cta"
              href={CHROME_WEB_STORE_URL}
              target="_blank"
              rel="noreferrer"
            >
              Get Axe — free
            </a>
          </div>
        </div>
      </header>

      <section className="conversion-hero" aria-labelledby="hero-title">
        <div className="conversion-hero__glow" aria-hidden="true" />
        <div className="conversion-hero__inner">
          <div className="conversion-copy">
            <h1 id="hero-title">
              <span className="conversion-line conversion-line--one">
                Trying to stay consistent on <XLogo className="headline-x-logo" />
              </span>
              <span className="conversion-line conversion-line--two">
                Don&apos;t know what to post daily?
              </span>
              <strong className="conversion-line conversion-line--answer">
                Solve it with Axe and hit bangers.
              </strong>
            </h1>
            <a
              className="conversion-cta"
              href={CHROME_WEB_STORE_URL}
              target="_blank"
              rel="noreferrer"
            >
              <span className="conversion-cta__x" aria-hidden="true"><XLogo /></span>
              <span>Add Axe to Chrome</span>
              <StoreArrowIcon />
            </a>
            <span className="conversion-note">Free Chrome extension</span>
          </div>

          <div className="product-stage" aria-label="Axe creator tracking interface preview">
            <div className="product-stage__halo" aria-hidden="true" />
            <div className="product-window">
              <div className="product-window__topbar">
                <div className="product-window__brand">
                  <AxeMark />
                  <div>
                    <strong>Axe</strong>
                    <span>Your writing compass</span>
                  </div>
                </div>
                <span className="window-dots" aria-hidden="true"><i /><i /><i /></span>
              </div>

              <div className="product-tabs">
                <span>Posts</span>
                <span className="active">Creators</span>
              </div>

              <div className="product-content">
                <div className="product-heading">
                  <div>
                    <span>YOUR CIRCLE</span>
                    <h2>Creators</h2>
                  </div>
                  <strong>3</strong>
                </div>

                <div className="creator-search">
                  <span>@</span>
                  <span>Add a creator</span>
                  <button type="button" tabIndex={-1}>Add</button>
                </div>

                <div className="creator-preview-list">
                  <article className="creator-preview-card">
                    <img src="/avatars/levelsio.jpg" alt="" width="48" height="48" />
                    <div><strong>Pieter Levels</strong><span>@levelsio · 954.2K followers</span></div>
                    <span className="creator-preview-remove">×</span>
                  </article>
                  <article className="creator-preview-card">
                    <img src="/avatars/marclou.jpg" alt="" width="48" height="48" />
                    <div><strong>Marc Lou</strong><span>@marclou · 392.6K followers</span></div>
                    <span className="creator-preview-remove">×</span>
                  </article>
                  <article className="creator-preview-card">
                    <img src="/avatars/justin-welsh-current.jpg" alt="" width="48" height="48" />
                    <div><strong>Justin Welsh</strong><span>@thejustinwelsh · 588.6K followers</span></div>
                    <span className="creator-preview-remove">×</span>
                  </article>
                </div>
              </div>
            </div>
            <span className="product-side-tab" aria-hidden="true">Axe</span>
          </div>
        </div>

        <ScrollCue />
      </section>

      <section className="x-workflow" id="how-it-works" aria-labelledby="workflow-title">
        <div className="workflow-shell">
          <div className="workflow-metric">
            <span className="workflow-metric__eyebrow">Don&apos;t miss the good ones</span>
            <div className="workflow-metric__number" aria-hidden="true">
              <span>35</span>
            </div>
            <h2 id="workflow-title">replies per week</h2>
            <p>Five solid conversations a day. No staring at the timeline.</p>
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
                <strong>How your five show up</strong>
              </div>
              <MoreIcon />
            </div>

            <article className="thread-post thread-post--like">
              <AxeIdentity />
              <div className="thread-post__body">
                <p>Your favorite creators are already posting.</p>
                <span className="thread-action thread-action--like">
                  <span><LikeIcon /></span>
                  Like
                </span>
              </div>
            </article>

            <article className="thread-post thread-post--bookmark">
              <AxeIdentity />
              <div className="thread-post__body">
                <p>Axe spots the posts going off.</p>
                <span className="thread-action thread-action--bookmark">
                  <span><BookmarkIcon /></span>
                  Bookmark
                </span>
              </div>
            </article>

            <article className="thread-post thread-post--repost">
              <AxeIdentity />
              <div className="thread-post__body">
                <p>You get 5 solid ways to jump in.</p>
                <span className="thread-action thread-action--green">
                  <span><RepostIcon /></span>
                  Repost
                </span>
              </div>
            </article>

            <div className="workflow-install">
              <div>
                <strong>Tomorrow&apos;s timeline won&apos;t wait.</strong>
                <span>Your five are one click away.</span>
              </div>
              <a
                href={CHROME_WEB_STORE_URL}
                target="_blank"
                rel="noreferrer"
              >
                Get Axe — free
                <StoreArrowIcon />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="proof-section" aria-label="The idea behind Axe">
        <div className="proof-section__inner">
          <div className="proof-copy">
            <span>THE THESIS</span>
            <h2>Showing up beats waiting for the perfect post.</h2>
          </div>

          <article className="x-post x-post--proof">
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
            <div className="post-body">
              <p>Twitter observation:</p>
              <p>Accounts growing crazy fast don&apos;t have the best content.</p>
              <p>They have:</p>
              <ol>
                <li>A clear profile</li>
                <li>Helpful content, daily</li>
                <li>A deep network built through regular engagement</li>
              </ol>
              <p>Nothing fancy. All meaningful.</p>
            </div>
            <PostActions animated />
          </article>
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

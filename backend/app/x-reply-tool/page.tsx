import type { Metadata } from "next";
import { CHROME_WEB_STORE_URL } from "@/lib/links";
import { SeoShell, seoStyles as styles } from "../components/SeoShell";

export const metadata: Metadata = {
  title: "X Reply Tool for Finding Conversations Worth Joining",
  description: "Axe finds timely posts from creators you choose and gives you useful directions for writing a thoughtful X reply in your own voice.",
  alternates: { canonical: "/x-reply-tool" },
};

export default function XReplyToolPage() {
  return (
    <SeoShell>
      <article className={styles.article}>
        <p className={styles.eyebrow}>X reply tool</p>
        <h1>Find the X posts worth replying to.</h1>
        <p className={styles.lede}>Axe is a browser extension that watches the creators you care about, surfaces their strongest recent posts, and helps you find a useful angle for your reply.</p>
        <a className={styles.cta} href={CHROME_WEB_STORE_URL} target="_blank" rel="noreferrer">Get Axe for Chrome</a>

        <h2>What does an X reply tool do?</h2>
        <p>An X reply tool helps you find relevant conversations and contribute while they are still active. Axe ranks recent posts across creators you select, then shows a few concise directions you can use to write your own reply.</p>

        <h2>How Axe works</h2>
        <ol>
          <li>Add public X creators you want to follow closely.</li>
          <li>Ask Axe to find recent reply opportunities.</li>
          <li>Review one ranked feed instead of checking every profile.</li>
          <li>Open a promising post and explore possible angles.</li>
          <li>Write, copy, and publish the final reply yourself.</li>
        </ol>

        <h2>A reply assistant, not a reply bot</h2>
        <p>Axe does not publish replies automatically or fill your account with generic AI comments. It helps with discovery and the difficult first step of thinking. You remain responsible for the final words and whether to post them.</p>

        <div className={styles.callout}>
          <p><strong>Best for:</strong> founders, small creators, consultants, freelancers, and personal-brand builders who want to grow on X through thoughtful participation.</p>
          <a href="/resources/how-to-grow-on-x-with-replies">Read the reply-first growth guide →</a>
        </div>
      </article>
    </SeoShell>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { SeoShell, seoStyles as styles } from "../components/SeoShell";

export const metadata: Metadata = {
  title: "X Growth Resources",
  description: "Practical guides for growing on X through timely, thoughtful replies and consistent participation.",
  alternates: { canonical: "/resources" },
};

export default function ResourcesPage() {
  return (
    <SeoShell>
      <section className={styles.article}>
        <p className={styles.eyebrow}>Axe resources</p>
        <h1>Grow on X by joining better conversations.</h1>
        <p className={styles.lede}>Short, practical guides for creators who want to earn attention without automated replies or endless scrolling.</p>
        <div className={styles.cards}>
          <Link className={styles.card} href="/resources/how-to-grow-on-x-with-replies">
            <strong>How to grow on X with replies</strong>
            <span>A simple reply-first routine: who to follow, which posts to choose, and what to add.</span>
          </Link>
          <Link className={styles.card} href="/x-reply-tool">
            <strong>X reply tools: what to look for</strong>
            <span>How Axe finds timely conversations without writing or publishing generic replies for you.</span>
          </Link>
        </div>
      </section>
    </SeoShell>
  );
}

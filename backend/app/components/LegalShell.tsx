import Link from "next/link";
import type { ReactNode } from "react";
import styles from "../legal.module.css";

type LegalShellProps = {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
};

export function LegalShell({ eyebrow, title, intro, children }: LegalShellProps) {
  return (
    <main className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />

      <header className={styles.header}>
        <Link className="brand" href="/" aria-label="Axe home">
          <span className="brand__mark" aria-hidden="true">
            <span />
          </span>
          <span>Axe</span>
        </Link>

        <Link className={styles.back} href="/">
          Back to Axe
        </Link>
      </header>

      <article className={styles.article}>
        <div className={styles.hero}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1>{title}</h1>
          <p className={styles.intro}>{intro}</p>
          <p className={styles.updated}>Effective August 30, 2026</p>
        </div>

        <div className={styles.content}>{children}</div>
      </article>

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} Axe</p>
        <nav aria-label="Legal and support">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/support">Support</Link>
        </nav>
        <a href="mailto:dev.ujjwal.mathur@gmail.com">
          dev.ujjwal.mathur@gmail.com
        </a>
      </footer>
    </main>
  );
}

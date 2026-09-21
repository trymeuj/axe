import Link from "next/link";
import type { ReactNode } from "react";
import styles from "../seo.module.css";

export function SeoShell({ children }: { children: ReactNode }) {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="Axe home">
          <span aria-hidden="true">A</span>
          Axe
        </Link>
        <nav aria-label="Primary navigation">
          <Link href="/x-reply-tool">X reply tool</Link>
          <Link href="/resources">Resources</Link>
          <Link href="/pricing">Pricing</Link>
        </nav>
      </header>
      {children}
      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} Axe</span>
        <div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/support">Support</Link></div>
      </footer>
    </main>
  );
}

export { styles as seoStyles };

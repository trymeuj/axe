import type { Metadata } from "next";
import { LegalShell } from "../components/LegalShell";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Support | Axe",
  description: "Installation help, troubleshooting, and contact information for Axe.",
};

export default function SupportPage() {
  return (
    <LegalShell
      eyebrow="Support"
      title="Let’s get Axe working."
      intro="Quick answers for installation, using the extension, and managing your local data."
    >
      <section>
        <h2>Contact</h2>
        <p>
          For product help, privacy questions, or deletion requests, email{" "}
          <a href="mailto:dev.ujjwal.mathur@gmail.com">
            dev.ujjwal.mathur@gmail.com
          </a>
          . Include your browser, what you were trying to do, and any error shown
          by Axe. Do not send passwords, API keys, or private X information.
        </p>
      </section>

      <section>
        <h2>Installation</h2>
        <p>
          Axe is being prepared for an unlisted Chrome Web Store release. When
          approved, its private Store link will be published on the Axe landing
          page. That link will provide normal installation and automatic updates
          in Chrome and compatible Brave versions.
        </p>
        <p className={styles.note}>
          Axe only appears on <strong>x.com</strong> and <strong>twitter.com</strong>.
          After installation, open or refresh X and use the Axe tab on the right.
        </p>
      </section>

      <section>
        <h2>Using Axe</h2>
        <ol>
          <li>Open X and expand the Axe sidebar.</li>
          <li>Search for a public creator and add them.</li>
          <li>Find recent reply opportunities across all tracked creators.</li>
          <li>Open an Inspiration Card to see possible ways into the conversation.</li>
          <li>Write your version, press <strong>Copy post</strong>, and publish it yourself on X.</li>
        </ol>
      </section>

      <section>
        <h2>Common fixes</h2>
        <h3>Axe does not appear</h3>
        <p>
          Confirm the extension is enabled, then refresh x.com. If necessary,
          close and reopen the X tab after updating Axe.
        </p>

        <h3>A creator cannot be found</h3>
        <p>
          Try the creator&apos;s public username without the @ symbol. Private,
          suspended, unavailable, or recently renamed accounts may not resolve.
        </p>

        <h3>Reply opportunities do not load</h3>
        <p>
          Retry after a moment. X data, TwitterAPI.io, OpenAI, or Axe&apos;s backend
          may be temporarily unavailable or rate limited.
        </p>

        <h3>Copy post does not work</h3>
        <p>
          Make sure the draft is not empty and that your browser allows clipboard
          access for the extension. You can still select and copy the draft manually.
        </p>
      </section>

      <section>
        <h2>Delete local Axe data</h2>
        <p>
          Removing tracked creators deletes them from Axe&apos;s local list. To remove
          all locally stored creators, results, Idea Slate state, and drafts,
          clear the extension&apos;s stored data or uninstall Axe. For help with a
          server-side privacy request, contact the email above.
        </p>
      </section>

      <section>
        <h2>Before reporting an AI result</h2>
        <p>
          AI output can be wrong or miss context. Open the original source post
          first. When reporting a bad result, share the public creator username
          and source-post link, but do not include private information or a draft
          you do not want reviewed.
        </p>
      </section>
    </LegalShell>
  );
}

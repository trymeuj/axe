import type { Metadata } from "next";
import { LegalShell } from "../components/LegalShell";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy | Axe",
  description: "How Axe collects, processes, stores, and protects information.",
};

export default function PrivacyPage() {
  return (
    <LegalShell
      eyebrow="Privacy"
      title="Clear by default."
      intro="This policy explains what Axe processes, where it goes, and what stays on your device."
    >
      <section>
        <h2>Overview</h2>
        <p>
          Axe is a browser extension that helps people find public X posts worth
          replying to and develop their own responses. Axe is published by Axe
          and can be contacted at{" "}
          <a href="mailto:dev.ujjwal.mathur@gmail.com">
            dev.ujjwal.mathur@gmail.com
          </a>
          .
        </p>
        <p className={styles.note}>
          The short version: Axe uses public X data, never connects to your X
          account, never posts for you, and keeps your drafts in your browser.
        </p>
      </section>

      <section>
        <h2>Information Axe processes</h2>
        <h3>Creator searches and public X data</h3>
        <p>
          When you search for or track a creator, Axe sends the search text or
          public username to its backend. Axe retrieves public profile details,
          public posts, timestamps, and visible engagement counts through
          TwitterAPI.io.
        </p>

        <h3>AI processing</h3>
        <p>
          Axe ranks recent public posts and sends selected public post text,
          creator usernames, source-post identifiers, and engagement counts to
          OpenAI. OpenAI returns concise inspiration and possible directions for
          joining the conversation.
        </p>

        <h3>Information kept in your browser</h3>
        <p>
          Your tracked creators, generated results, selected Idea Slate, scroll
          position, and drafts are stored locally in your browser. Draft text is
          not sent to Axe, TwitterAPI.io, or OpenAI. Clipboard access is used only
          after you press <strong>Copy post</strong>.
        </p>

        <h3>Operational information</h3>
        <p>
          Axe&apos;s hosting provider may process basic request information such as
          request paths, search parameters, IP address, user agent, timestamps,
          status codes, and error details. Axe uses this information only to
          operate, secure, and troubleshoot the service.
        </p>
      </section>

      <section>
        <h2>What Axe does not access</h2>
        <ul>
          <li>Your X password, authentication cookies, or account credentials.</li>
          <li>Direct messages, private accounts, or other private X data.</li>
          <li>The contents of your X feed or general browsing history.</li>
          <li>Your draft text outside the local browser storage described above.</li>
        </ul>
        <p>
          Axe does not post, reply, like, follow, or perform any other action on
          X automatically. No X OAuth connection is used.
        </p>
      </section>

      <section>
        <h2>How information is used</h2>
        <ul>
          <li>To search for public creators and display their public profiles.</li>
          <li>To rank recent public posts and generate inspiration.</li>
          <li>To maintain, secure, debug, and improve Axe&apos;s core features.</li>
          <li>To respond to support, privacy, or legal requests.</li>
        </ul>
        <p>
          Axe does not sell information or use it for personalized advertising,
          retargeting, credit decisions, or unrelated profiling.
        </p>
      </section>

      <section>
        <h2>Service providers</h2>
        <p>Axe relies on the following providers to deliver its core service:</p>
        <ul>
          <li><strong>Vercel</strong> for website, API, and operational hosting.</li>
          <li><strong>TwitterAPI.io</strong> for retrieving public X data.</li>
          <li><strong>OpenAI</strong> for processing selected public post content.</li>
        </ul>
        <p>
          Neon database infrastructure is connected to the Axe project, but the
          current extension flow does not persist tracked creators, generated
          results, or drafts there.
        </p>
        <p>
          Information may also be disclosed when required by law, to protect the
          service and its users, or with your explicit consent. Axe does not allow
          people to read user data except when you request support involving that
          data, for security, or where legally required.
        </p>
      </section>

      <section>
        <h2>Storage and retention</h2>
        <p>
          Locally stored information remains in your browser until you remove it,
          clear the extension&apos;s storage, or uninstall Axe. The current extension
          flow does not create a persistent Axe account record or store drafts in
          Axe&apos;s database.
        </p>
        <p>
          Infrastructure logs are retained according to the hosting plan and are
          generally available for no more than 30 days. OpenAI may retain API
          abuse-monitoring data for up to 30 days unless a longer period is
          legally required. Other providers process information under their own
          contractual and privacy terms.
        </p>
      </section>

      <section>
        <h2>Your choices and deletion</h2>
        <p>
          You can remove creators inside Axe, clear Axe&apos;s browser storage, or
          uninstall the extension to delete locally stored information. To ask
          about information held in operational systems, request access, or
          request deletion, email{" "}
          <a href="mailto:dev.ujjwal.mathur@gmail.com">
            dev.ujjwal.mathur@gmail.com
          </a>
          . Axe may need enough information to verify and complete the request.
        </p>
      </section>

      <section>
        <h2>Security and international processing</h2>
        <p>
          Production requests are transmitted using HTTPS. Axe limits data use
          to what is necessary for the product&apos;s stated purpose, but no online
          system can guarantee absolute security. Service providers may process
          information in countries other than your own, subject to their
          safeguards and applicable law.
        </p>
      </section>

      <section>
        <h2>Chrome Web Store Limited Use</h2>
        <p>
          Axe&apos;s use and transfer of information received through browser
          permissions complies with the Chrome Web Store User Data Policy,
          including its Limited Use requirements. Information is used only to
          provide or improve Axe&apos;s disclosed single purpose, maintain security,
          comply with law, or act with your consent.
        </p>
      </section>

      <section>
        <h2>Children and policy changes</h2>
        <p>
          Axe is not directed to children under 13. We may update this policy as
          Axe changes. Material changes will be disclosed through the website,
          extension, or Store listing before new processing begins where required.
        </p>
      </section>
    </LegalShell>
  );
}

import type { Metadata } from "next";
import { LegalShell } from "../components/LegalShell";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Terms of Use | Axe",
  description: "The terms that govern use of the Axe website and extension.",
};

export default function TermsPage() {
  return (
    <LegalShell
      eyebrow="Terms"
      title="Use Axe thoughtfully."
      intro="These terms govern the current free Axe alpha, website, and browser extension."
    >
      <section>
        <h2>Agreement</h2>
        <p>
          By installing or using Axe, you agree to these Terms. If you do not
          agree, do not use the service. Axe is published by Axe and can be
          contacted at{" "}
          <a href="mailto:dev.ujjwal.mathur@gmail.com">
            dev.ujjwal.mathur@gmail.com
          </a>
          .
        </p>
      </section>

      <section>
        <h2>The current service</h2>
        <p>
          Axe is currently offered as a free alpha. It helps users discover
          recent public X posts from selected creators, see AI-assisted thinking
          directions, write their own draft, and copy it for use on X.
        </p>
        <p className={styles.note}>
          Axe does not post automatically. You decide what to write, whether to
          publish it, and remain responsible for your final post.
        </p>
        <p>
          If paid plans are introduced, pricing, renewal, cancellation, refund,
          and payment terms will be shown before you purchase. No paid
          subscription terms apply to the current free alpha.
        </p>
      </section>

      <section>
        <h2>Who may use Axe</h2>
        <p>
          You must be legally able to agree to these Terms. If you use Axe for a
          business or another organization, you confirm that you have authority
          to bind that organization.
        </p>
      </section>

      <section>
        <h2>Your drafts and responsibility</h2>
        <p>
          You retain ownership of your drafts and final posts. Current drafts
          remain locally in your browser and are not uploaded to Axe. You are
          responsible for checking accuracy, context, tone, legality, and the
          rights of others before publishing anything.
        </p>
        <p>
          Do not use Axe for harassment, spam, impersonation, deception, unlawful
          conduct, infringement, platform manipulation, or attempts to bypass X
          or third-party safeguards.
        </p>
      </section>

      <section>
        <h2>AI and public-data limitations</h2>
        <p>
          Axe processes public information and uses automated systems. Results
          may be incomplete, outdated, inaccurate, or inappropriate for a
          particular context. Source links are provided so you can review the
          original post before relying on a suggestion.
        </p>
        <p>
          Axe does not guarantee follower growth, engagement, reach, replies,
          revenue, availability of any creator&apos;s posts, or any particular
          outcome from using the service.
        </p>
      </section>

      <section>
        <h2>Third-party services</h2>
        <p>
          Axe depends on X and other third-party services. Their availability,
          policies, interfaces, and data may change without Axe&apos;s control. Your
          use of X remains subject to X&apos;s own terms and policies.
        </p>
        <p>
          Axe is an independent product and is not affiliated with, endorsed by,
          or sponsored by X, any tracked creator, TwitterAPI.io, OpenAI, Google,
          Brave, or Vercel.
        </p>
      </section>

      <section>
        <h2>Availability and changes</h2>
        <p>
          Because Axe is an alpha, features may change, break, be limited, or be
          discontinued. Access may be restricted to protect the service, prevent
          abuse, comply with law, or manage technical and provider limitations.
        </p>
      </section>

      <section>
        <h2>Disclaimers and liability</h2>
        <p>
          To the fullest extent permitted by law, Axe is provided “as is” and “as
          available,” without warranties of accuracy, reliability, fitness for a
          particular purpose, or uninterrupted availability.
        </p>
        <p>
          To the fullest extent permitted by law, Axe will not be liable for
          indirect, incidental, special, consequential, or punitive damages, loss
          of data, lost profits, reputational harm, or decisions made from
          generated output. Mandatory consumer rights remain unaffected.
        </p>
      </section>

      <section>
        <h2>Changes and contact</h2>
        <p>
          These Terms may change as the product develops. Material changes will
          be posted on this page or communicated through Axe. Questions can be
          sent to{" "}
          <a href="mailto:dev.ujjwal.mathur@gmail.com">
            dev.ujjwal.mathur@gmail.com
          </a>
          .
        </p>
      </section>
    </LegalShell>
  );
}

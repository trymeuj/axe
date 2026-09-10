import { signIn } from "@/lib/auth";
import styles from "../auth.module.css";

export default function SignInPage() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.mark}>A</div>
        <p className={styles.eyebrow}>Axe account</p>
        <h1>Sign in to continue</h1>
        <p className={styles.copy}>
          Use Google to access your Axe account. This never connects or authorizes your X account.
        </p>
        <form action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/account" });
        }}>
          <button className={styles.primary} type="submit">Continue with Google</button>
        </form>
      </section>
    </main>
  );
}

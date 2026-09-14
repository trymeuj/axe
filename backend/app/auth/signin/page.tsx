import { signIn } from "@/lib/auth";
import styles from "../auth.module.css";

type SignInPageProps = {
  searchParams: Promise<{ plan?: string; region?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.plan === "monthly" || params.plan === "quarterly") query.set("plan", params.plan);
  if (params.region === "standard" || params.region === "india") query.set("region", params.region);
  const redirectTo = query.size ? `/account?${query.toString()}` : "/account";
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
          await signIn("google", { redirectTo });
        }}>
          <button className={styles.primary} type="submit">Continue with Google</button>
        </form>
      </section>
    </main>
  );
}

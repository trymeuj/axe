import { redirect } from "next/navigation";
import { auth, signIn, signOut } from "@/lib/auth";
import { approveExtensionConnection, getUserAccess } from "@/lib/extension-auth";
import styles from "../auth/auth.module.css";

type PageProps = {
  searchParams: Promise<{ code?: string; connected?: string; error?: string }>;
};

export default async function ConnectExtensionPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const code = params.code ?? "";
  const session = await auth();
  const access = session?.user?.id ? await getUserAccess(session.user.id) : null;
  const returnTo = `/connect-extension?code=${encodeURIComponent(code)}`;

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.mark}>A</div>
        <p className={styles.eyebrow}>Extension activation</p>
        {params.connected === "1" ? (
          <>
            <h1 className={styles.success}>Extension connected</h1>
            <p className={styles.copy}>Return to X. Axe will finish checking your access automatically.</p>
          </>
        ) : !code ? (
          <>
            <h1>Connection expired</h1>
            <p className={styles.copy}>Return to Axe and start the sign-in process again.</p>
          </>
        ) : !session?.user?.id ? (
          <>
            <h1>Connect Axe</h1>
            <p className={styles.copy}>Sign in with Google to connect this extension to your Axe account.</p>
            <form action={async () => {
              "use server";
              await signIn("google", { redirectTo: returnTo });
            }}>
              <button className={styles.primary} type="submit">Continue with Google</button>
            </form>
          </>
        ) : (
          <>
            <h1>Connect this extension?</h1>
            <p className={styles.copy}>Choose which Axe account to connect to this extension.</p>
            {!access?.paid && <p className={`${styles.identity} ${styles.warning}`}>Your account does not have paid access yet.</p>}
            {params.error && <p className={`${styles.identity} ${styles.warning}`}>This connection is invalid or expired.</p>}
            <form action={async () => {
              "use server";
              const currentSession = await auth();
              if (!currentSession?.user?.id) redirect(returnTo);
              const approved = await approveExtensionConnection(code, currentSession.user.id);
              redirect(`${returnTo}&${approved ? "connected=1" : "error=1"}`);
            }}>
              <button className={styles.primary} type="submit">Connect as {session.user.email}</button>
            </form>
            <form className={styles.compactForm} action={async () => {
              "use server";
              await signOut({ redirect: false });
              await signIn("google", { redirectTo: returnTo }, { prompt: "select_account" });
            }}>
              <button className={styles.secondaryWide} type="submit">Use another Google account</button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}

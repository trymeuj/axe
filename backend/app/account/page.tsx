import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { getUserAccess } from "@/lib/extension-auth";
import styles from "../auth/auth.module.css";
import { SubscribeButton } from "./SubscribeButton";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");
  const access = await getUserAccess(session.user.id);

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.mark}>A</div>
        <p className={styles.eyebrow}>Your Axe account</p>
        <h1>{access.paid ? "Axe is active" : "Complete your access"}</h1>
        <p className={styles.copy}>
          {access.paid
            ? "Your paid access is active. You can connect and use the Axe extension."
            : "You are signed in. Complete checkout to unlock Axe in your extension."}
        </p>
        <p className={styles.identity}>{session.user.email}</p>
        {!access.paid ? <SubscribeButton email={session.user.email} name={session.user.name} /> : null}
        <form action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}>
          <button className={styles.secondary} type="submit">Sign out</button>
        </form>
      </section>
    </main>
  );
}

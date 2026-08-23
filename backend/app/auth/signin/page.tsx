export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-3xl tracking-tight">Axe</span>
        </div>
        <p className="text-zinc-400 text-sm text-center max-w-xs">
          Axe currently uses public X account information and does not require
          you to connect or authorize your X account.
        </p>
      </div>
    </div>
  );
}

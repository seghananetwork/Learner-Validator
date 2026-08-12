export default function AuthError() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 text-center">
      <div>
        <h1 className="font-display text-2xl mb-2">Account not approved</h1>
        <p className="text-ink/60 max-w-sm">
          This Google account isn&rsquo;t on the approved field-staff list for this tool. Ask your
          MERL coordinator to add your email, then try again.
        </p>
      </div>
    </main>
  );
}

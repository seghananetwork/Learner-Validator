function parseList(v: string | undefined): string[] {
  return (v || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdmin(email?: string | null): boolean {
  if (!email) return false;
  const admins = parseList(process.env.ADMIN_EMAILS);
  return admins.includes(email.toLowerCase());
}

export function isAllowed(email?: string | null): boolean {
  if (!email) return false;
  const allowed = parseList(process.env.ALLOWED_EMAILS);
  if (allowed.length === 0) return true; // allow-list disabled
  return allowed.includes(email.toLowerCase()) || isAdmin(email);
}

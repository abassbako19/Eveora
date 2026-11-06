export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://eveora.onrender.com").replace(/\/$/, "");
export const AUTH_CALLBACK_URL = `${SITE_URL}/auth/callback`;

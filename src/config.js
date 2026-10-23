// Everything comes from .env (see .env.example); nothing is hardcoded here.
export const PORTAL_ID = import.meta.env.PUBLIC_NIGHTAUTH_PORTAL_ID?.trim() || "";
// Only shown until /api/customer/info returns the portal's real name.
export const APP_NAME = import.meta.env.PUBLIC_NIGHTAUTH_APP_NAME?.trim() || "";
// Same origin: /api/* is proxied to NightAuth (dev proxy or your reverse proxy).
export const API_BASE = "";

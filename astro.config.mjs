import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import { loadEnv } from "vite";

const env = loadEnv(process.env.NODE_ENV || "development", process.cwd(), "");
// No default instance: the dev proxy only exists once .env says where NightAuth is.
const apiUrl = env.PUBLIC_NIGHTAUTH_API_URL?.trim();
if (!apiUrl) console.warn("[portal] PUBLIC_NIGHTAUTH_API_URL is not set in .env: /api/* will not be proxied.");

// NightAuth sets its customer cookies as `__Host-customer-*` (session and the
// pending-2FA step). Browsers only accept `__Host-` cookies over HTTPS, so the
// dev proxy renames them for http://localhost and restores the prefix on the
// way back. Production serves the portal over HTTPS and needs none of this.
const HOST_COOKIE = /__Host-(customer-[\w-]+)/g;
const DEV_COOKIE = /(^|;\s*)(customer-[\w-]+)=/g;

export default defineConfig({
  integrations: [tailwind()],
  output: "static",
  vite: {
    server: {
      proxy: apiUrl ? {
        "/api": {
          target: apiUrl,
          changeOrigin: true,
          // Only for a local NightAuth behind a self-signed certificate.
          secure: env.NIGHTAUTH_PROXY_INSECURE_TLS !== "1",
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq, req) => {
              const url = new URL(apiUrl);
              proxyReq.setHeader("host", url.host);
              proxyReq.setHeader("origin", url.origin);
              const cookie = req.headers["cookie"];
              if (cookie) proxyReq.setHeader("cookie", cookie.replace(DEV_COOKIE, "$1__Host-$2="));
            });
            proxy.on("proxyRes", (proxyRes) => {
              const setCookie = proxyRes.headers["set-cookie"];
              if (setCookie) {
                proxyRes.headers["set-cookie"] = setCookie.map((c) =>
                  c
                    .replace(HOST_COOKIE, "$1")
                    .replace(/;\s*Secure/gi, "")
                    .replace(/;\s*SameSite=Strict/gi, "; SameSite=Lax"),
                );
              }
            });
          },
        },
      } : undefined,
    },
  },
});

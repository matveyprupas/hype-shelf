import type { AuthConfig } from "convex/server";

/**
 * Clerk JWT validation for Convex.
 * Set CLERK_JWT_ISSUER_DOMAIN in Convex Dashboard (Settings → Environment Variables).
 * Get the Issuer URL from Clerk Dashboard → JWT Templates → Convex template.
 */
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN ?? "",
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;

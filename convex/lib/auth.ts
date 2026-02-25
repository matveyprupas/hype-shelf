import type { UserIdentity } from "convex/server";

/**
 * Identity shape from Clerk JWT template.
 *
 * Configure in Clerk Dashboard → JWT Templates → Convex:
 * - "role": "{{user.public_metadata.role}}"
 * - Optionally "name": "{{user.full_name}}" for full name
 *
 * subject (sub) is always present and is the Clerk user ID.
 */
export interface ClerkIdentity extends UserIdentity {
  readonly userId?: string;
  readonly fullName?: string;
  readonly metadata?: {
    readonly role?: string;
  };
}

/**
 * Returns the authenticated identity with proper Clerk typing.
 * Throws if not authenticated.
 *
 * Centralizes the type assertion in one place. The cast is safe because
 * we control the Clerk JWT template and know which claims are included.
 *
 * @example
 * const identity = await ctx.auth.getUserIdentity();
 * const clerk = getAuthenticatedIdentity(identity, "You must be signed in to add a recommendation.");
 */
export function getAuthenticatedIdentity(
  identity: UserIdentity | null,
  errorMessage = "You must be signed in."
): ClerkIdentity {
  if (!identity) {
    throw new Error(errorMessage);
  }
  return identity as ClerkIdentity;
}

import type { UserIdentity } from "convex/server";
import { Role } from "@/lib/roles";

/**
 * Identity shape from Clerk JWT template.
 *
 * Configure in Clerk Dashboard → JWT Templates → Convex:
 * - "metadata": { "role": "{{user.public_metadata.role}}" }
 * - (Optional fallback during migration) "role": "{{user.public_metadata.role}}"
 * - Optionally "name": "{{user.full_name}}" for full name
 *
 * subject (sub) is always present and is the Clerk user ID.
 */
export interface ClerkIdentity extends UserIdentity {
  readonly userId?: string;
  readonly fullName?: string;
  readonly role?: Role;
  readonly metadata?: {
    readonly role?: Role;
  };
}

export enum AuthErrorCode {
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
}

interface AuthError extends Error {
  readonly code: AuthErrorCode;
}

function makeAuthError(code: AuthErrorCode, message: string): AuthError {
  const error = new Error(message) as AuthError;
  error.name = code;
  (error as { code: AuthErrorCode }).code = code;
  return error;
}

export function unauthorized(message = "Unauthorized"): never {
  throw makeAuthError(AuthErrorCode.UNAUTHORIZED, message);
}

export function forbidden(message = "Forbidden"): never {
  throw makeAuthError(AuthErrorCode.FORBIDDEN, message);
}

function toRole(value: unknown): Role | undefined {
  if (value === Role.ADMIN || value === Role.USER) {
    return value;
  }
  return undefined;
}

export function getRole(identity: ClerkIdentity): Role | undefined {
  // Prefer metadata.role from Clerk JWT template, keep top-level role fallback
  // for compatibility with older templates.
  const metadataRole = toRole(identity.metadata?.role);
  if (metadataRole) {
    return metadataRole;
  }
  const role = toRole(identity.role);
  if (role) {
    return role;
  }
  return undefined;
}

export function isAdmin(identity: ClerkIdentity): boolean {
  return getRole(identity) === Role.ADMIN;
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
    unauthorized(errorMessage);
  }
  return identity as ClerkIdentity;
}

export function requireSignedIn(
  identity: UserIdentity | null,
  errorMessage = "You must be signed in."
): ClerkIdentity {
  return getAuthenticatedIdentity(identity, errorMessage);
}

export function requireAdmin(
  identity: ClerkIdentity,
  errorMessage = "Only admins can perform this action."
): void {
  if (!isAdmin(identity)) {
    forbidden(errorMessage);
  }
}

export function requireOwnerOrAdmin(args: {
  identity: ClerkIdentity;
  ownerId: string;
  errorMessage?: string;
}): void {
  const {
    identity,
    ownerId,
    errorMessage = "You can only modify your own data.",
  } = args;
  if (identity.subject === ownerId || isAdmin(identity)) {
    return;
  }
  forbidden(errorMessage);
}

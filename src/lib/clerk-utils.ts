import { Role } from "./roles";

/**
 * Safely extracts the role from Clerk's publicMetadata.
 * publicMetadata is Record<string, unknown>, so we validate the type at runtime.
 */
export function getPublicMetadataRole(
  metadata: Record<string, unknown> | undefined
): Role | undefined {
  const role = metadata?.role;
  if (role === Role.ADMIN || role === Role.USER) {
    return role;
  }
  return undefined;
}

/**
 * Safely extracts the role from Clerk's publicMetadata.
 * publicMetadata is Record<string, unknown>, so we validate the type at runtime.
 */
export function getPublicMetadataRole(
  metadata: Record<string, unknown> | undefined
): string | undefined {
  const role = metadata?.role;
  return typeof role === "string" ? role : undefined;
}

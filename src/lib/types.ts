import type { Id } from "../../convex/_generated/dataModel";
import type { Genre } from "./genres";

/**
 * Recommendation type – aligns with Convex schema.
 * Fields: title, genre, link, short blurb.
 */
export interface Recommendation {
  id: Id<"recommendations">;
  title: string;
  genre: Genre;
  link: string;
  blurb: string;
  addedBy?: string;
  /** Owner's Clerk user ID – present when viewer is authenticated */
  userId?: string;
  /** For admin "Staff Pick" feature */
  isStaffPick?: boolean;
  /** ISO date string */
  createdAt: string;
}

// Re-export Genre and genreLabels for consumers that import from types
export { Genre, genreLabels } from "./genres";

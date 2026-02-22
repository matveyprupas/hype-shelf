/**
 * Recommendation type – aligns with future Convex schema.
 * Fields: title, genre, link, short blurb.
 */
export type Genre =
  | "horror"
  | "action"
  | "comedy"
  | "drama"
  | "sci-fi"
  | "documentary"
  | "animation"
  | "thriller"
  | "other";

export interface Recommendation {
  id: string;
  title: string;
  genre: Genre;
  link: string;
  blurb: string;
  /** Populated once auth is implemented */
  addedBy?: string;
  /** For admin "Staff Pick" feature */
  isStaffPick?: boolean;
  /** ISO date string */
  createdAt: string;
}

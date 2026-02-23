/**
 * Recommendation type – aligns with future Convex schema.
 * Fields: title, genre, link, short blurb.
 */
export enum Genre {
  HORROR = "horror",
  ACTION = "action",
  COMEDY = "comedy",
  DRAMA = "drama",
  SCI_FI = "sci-fi",
  DOCUMENTARY = "documentary",
  ANIMATION = "animation",
  THRILLER = "thriller",
  OTHER = "other",
}

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

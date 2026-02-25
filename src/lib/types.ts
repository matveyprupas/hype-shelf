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

export const genreLabels: Record<Genre, string> = {
  [Genre.HORROR]: "Horror",
  [Genre.ACTION]: "Action",
  [Genre.COMEDY]: "Comedy",
  [Genre.DRAMA]: "Drama",
  [Genre.SCI_FI]: "Sci-Fi",
  [Genre.DOCUMENTARY]: "Documentary",
  [Genre.ANIMATION]: "Animation",
  [Genre.THRILLER]: "Thriller",
  [Genre.OTHER]: "Other",
};

export interface Recommendation {
  id: string;
  title: string;
  genre: Genre;
  link: string;
  blurb: string;
  addedBy?: string;
  /** Owner's Clerk user ID – only present when viewer is authenticated */
  userId?: string;
  /** For admin "Staff Pick" feature */
  isStaffPick?: boolean;
  /** ISO date string */
  createdAt: string;
}

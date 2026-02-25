/**
 * Single source of truth for genres – used by both frontend and Convex.
 */

export const Genre = {
  HORROR: "horror",
  ACTION: "action",
  COMEDY: "comedy",
  DRAMA: "drama",
  SCI_FI: "sci-fi",
  DOCUMENTARY: "documentary",
  ANIMATION: "animation",
  THRILLER: "thriller",
  OTHER: "other",
} as const;

export type Genre = (typeof Genre)[keyof typeof Genre];

/** All genre values in order – for iteration (e.g. form selects) */
export const GENRE_VALUES: readonly Genre[] = Object.values(Genre);

/** Display labels for each genre */
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

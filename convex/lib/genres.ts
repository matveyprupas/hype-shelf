import { v } from "convex/values";
import { GENRE_VALUES } from "@/lib/genres";

/** Convex validator for genre field – uses shared GENRE_VALUES */
export const genreValidator = v.union(...GENRE_VALUES.map((g) => v.literal(g)));

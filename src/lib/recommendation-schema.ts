import { z } from "zod";
import {
  BLURB_MAX,
  TITLE_MAX,
  URL_PATTERN,
} from "@/lib/recommendation-validation";
import { Genre } from "@/lib/types";

export const recommendationFormSchema = z.object({
  title: z
    .string()
    .refine((s) => s.trim().length > 0, "Title is required.")
    .refine(
      (s) => s.trim().length <= TITLE_MAX,
      `Title must be at most ${TITLE_MAX} characters.`
    ),
  genre: z.nativeEnum(Genre),
  link: z
    .string()
    .refine((s) => s.trim().length > 0, "Link is required.")
    .refine(
      (s) => URL_PATTERN.test(s.trim()),
      "Link must be a valid URL (e.g. https://…)."
    ),
  blurb: z
    .string()
    .refine((s) => s.trim().length > 0, "Blurb is required.")
    .refine(
      (s) => s.trim().length <= BLURB_MAX,
      `Blurb must be at most ${BLURB_MAX} characters.`
    ),
});

export type RecommendationFormValues = z.infer<typeof recommendationFormSchema>;

export function hasFormData(values: RecommendationFormValues): boolean {
  return !!(
    values.title.trim() ||
    values.link.trim() ||
    values.blurb.trim() ||
    values.genre !== Genre.OTHER
  );
}

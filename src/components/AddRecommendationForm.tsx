"use client";

import { useCallback, useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  BLURB_MAX,
  TITLE_MAX,
  URL_PATTERN,
} from "@/lib/recommendation-validation";
import { Genre, genreLabels } from "@/lib/types";

const GENRES: Genre[] = [
  Genre.HORROR,
  Genre.ACTION,
  Genre.COMEDY,
  Genre.DRAMA,
  Genre.SCI_FI,
  Genre.DOCUMENTARY,
  Genre.ANIMATION,
  Genre.THRILLER,
  Genre.OTHER,
];

export interface FormState {
  title: string;
  genre: Genre;
  link: string;
  blurb: string;
}

export interface FormErrors {
  title?: string;
  genre?: string;
  link?: string;
  blurb?: string;
}

export const initialFormState: FormState = {
  title: "",
  genre: Genre.OTHER,
  link: "",
  blurb: "",
};

function validateForm(form: FormState): FormErrors {
  const err: FormErrors = {};

  const title = form.title.trim();
  if (!title) err.title = "Title is required.";
  else if (title.length > TITLE_MAX)
    err.title = `Title must be at most ${TITLE_MAX} characters.`;

  const link = form.link.trim();
  if (!link) err.link = "Link is required.";
  else if (!URL_PATTERN.test(link))
    err.link = "Link must be a valid URL (e.g. https://…).";

  const blurb = form.blurb.trim();
  if (!blurb) err.blurb = "Blurb is required.";
  else if (blurb.length > BLURB_MAX)
    err.blurb = `Blurb must be at most ${BLURB_MAX} characters.`;

  return err;
}

export function hasFormData(form: FormState): boolean {
  return !!(
    form.title.trim() ||
    form.link.trim() ||
    form.blurb.trim() ||
    form.genre !== Genre.OTHER
  );
}

interface AddRecommendationFormProps {
  onCancel: () => void;
  onDirtyChange: (dirty: boolean) => void;
  onSuccess: () => void;
}

export function AddRecommendationForm({
  onCancel,
  onDirtyChange,
  onSuccess,
}: AddRecommendationFormProps) {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const createRec = useMutation(api.recommendations.create);

  const dirty = hasFormData(form);

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  const handleChange = useCallback(
    (field: keyof FormState) =>
      (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
      ) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) {
          setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
      },
    [errors]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);
      const errs = validateForm(form);
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;

      setIsSubmitting(true);
      try {
        await createRec({
          title: form.title.trim(),
          genre: form.genre,
          link: form.link.trim(),
          blurb: form.blurb.trim(),
        });
        onSuccess();
      } catch (err) {
        setSubmitError(
          err instanceof Error ? err.message : "Something went wrong. Try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, createRec, onSuccess]
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {submitError && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400"
        >
          {submitError}
        </div>
      )}

      <div>
        <label
          htmlFor="rec-title"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Title
        </label>
        <input
          id="rec-title"
          type="text"
          value={form.title}
          onChange={handleChange("title")}
          placeholder="e.g. Everything Everywhere All at Once"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
          autoFocus
          maxLength={TITLE_MAX + 20}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.title}
          </p>
        )}
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          {form.title.length}/{TITLE_MAX}
        </p>
      </div>

      <div>
        <label
          htmlFor="rec-genre"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Genre
        </label>
        <select
          id="rec-genre"
          value={form.genre}
          onChange={handleChange("genre")}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        >
          {GENRES.map((g) => (
            <option key={g} value={g}>
              {genreLabels[g]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="rec-link"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Link
        </label>
        <input
          id="rec-link"
          type="url"
          value={form.link}
          onChange={handleChange("link")}
          placeholder="https://..."
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
        />
        {errors.link && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.link}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="rec-blurb"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Short blurb
        </label>
        <textarea
          id="rec-blurb"
          value={form.blurb}
          onChange={handleChange("blurb")}
          placeholder="A brief description of why you recommend it..."
          rows={3}
          className="w-full resize-none rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
          maxLength={BLURB_MAX + 50}
        />
        {errors.blurb && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.blurb}
          </p>
        )}
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          {form.blurb.length}/{BLURB_MAX}
        </p>
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isSubmitting ? "Adding…" : "Add recommendation"}
        </button>
      </div>
    </form>
  );
}

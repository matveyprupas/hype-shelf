"use client";

import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { BLURB_MAX, TITLE_MAX } from "@/lib/recommendation-validation";
import {
  hasFormData,
  recommendationFormSchema,
  type RecommendationFormValues,
} from "@/lib/recommendation-schema";
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

const defaultValues: RecommendationFormValues = {
  title: "",
  genre: Genre.OTHER,
  link: "",
  blurb: "",
};

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
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    setError,
    clearErrors,
  } = useForm<RecommendationFormValues>({
    resolver: zodResolver(recommendationFormSchema),
    defaultValues,
    mode: "onBlur",
  });

  const createRec = useMutation(api.recommendations.create);
  const watchedValues = useWatch({ control }) as RecommendationFormValues;

  const dirty = useMemo(
    () => hasFormData(watchedValues ?? defaultValues),
    [watchedValues]
  );

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  const onSubmit = async (data: RecommendationFormValues) => {
    clearErrors("root");
    try {
      await createRec({
        title: data.title.trim(),
        genre: data.genre,
        link: data.link.trim(),
        blurb: data.blurb.trim(),
      });
      reset(defaultValues);
      onSuccess();
    } catch (err) {
      setError("root", {
        type: "manual",
        message:
          err instanceof Error
            ? err.message
            : "Something went wrong. Try again.",
      });
    }
  };

  const inputClassName =
    "w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500";
  const labelClassName =
    "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300";
  const errorClassName = "mt-1 text-sm text-red-600 dark:text-red-400";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {errors.root && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400"
        >
          {errors.root.message}
        </div>
      )}

      <div>
        <label htmlFor="rec-title" className={labelClassName}>
          Title
        </label>
        <input
          id="rec-title"
          type="text"
          {...register("title")}
          placeholder="e.g. Everything Everywhere All at Once"
          className={inputClassName}
          autoFocus
          maxLength={TITLE_MAX}
        />
        {errors.title && (
          <p className={errorClassName}>{errors.title.message}</p>
        )}
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          {(watchedValues?.title ?? "").length}/{TITLE_MAX}
        </p>
      </div>

      <div>
        <label htmlFor="rec-genre" className={labelClassName}>
          Genre
        </label>
        <select
          id="rec-genre"
          {...register("genre")}
          className={inputClassName}
        >
          {GENRES.map((g) => (
            <option key={g} value={g}>
              {genreLabels[g]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="rec-link" className={labelClassName}>
          Link
        </label>
        <input
          id="rec-link"
          type="url"
          {...register("link")}
          placeholder="https://..."
          className={inputClassName}
        />
        {errors.link && <p className={errorClassName}>{errors.link.message}</p>}
      </div>

      <div>
        <label htmlFor="rec-blurb" className={labelClassName}>
          Short blurb
        </label>
        <textarea
          id="rec-blurb"
          {...register("blurb")}
          placeholder="A brief description of why you recommend it..."
          rows={3}
          className={`${inputClassName} resize-none`}
          maxLength={BLURB_MAX}
        />
        {errors.blurb && (
          <p className={errorClassName}>{errors.blurb.message}</p>
        )}
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          {(watchedValues?.blurb ?? "").length}/{BLURB_MAX}
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

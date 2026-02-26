"use client";

import { useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getPublicMetadataRole } from "@/lib/clerk-utils";
import { GENRE_VALUES, genreLabels, type Genre } from "@/lib/genres";
import { Role } from "@/lib/roles";
import { RecommendationCard } from "./RecommendationCard";

export function RecommendationList() {
  const { user } = useUser();
  const [genreFilter, setGenreFilter] = useState<Genre | "all">("all");
  const recs = useQuery(api.recommendations.list, {
    genre: genreFilter === "all" ? undefined : genreFilter,
  });

  const currentUserId = user?.id ?? null;
  const isAdmin = getPublicMetadataRole(user?.publicMetadata) === Role.ADMIN;

  const items = useMemo(
    () =>
      recs?.map((rec) => ({
        id: rec.id,
        title: rec.title,
        genre: rec.genre,
        link: rec.link,
        blurb: rec.blurb,
        addedBy: rec.addedBy,
        userId: rec.userId,
        isStaffPick: rec.isStaffPick,
        createdAt: new Date(rec.createdAt).toISOString(),
      })) ?? [],
    [recs]
  );

  if (recs === undefined) {
    return (
      <div className="space-y-4">
        <GenreFilter genreFilter={genreFilter} setGenreFilter={setGenreFilter} />
        <div className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Loading recommendations…
        </div>
      </div>
    );
  }

  if (recs.length === 0) {
    return (
      <div className="space-y-6">
        <GenreFilter genreFilter={genreFilter} setGenreFilter={setGenreFilter} />
        <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {genreFilter === "all"
            ? "No recommendations yet. Sign in to add yours!"
            : `No recommendations in ${genreLabels[genreFilter]} yet.`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <GenreFilter genreFilter={genreFilter} setGenreFilter={setGenreFilter} />
      <ul className="flex flex-col gap-4">
      {items.map((rec) => (
        <li key={rec.id}>
          <RecommendationCard
            rec={rec}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
          />
        </li>
      ))}
      </ul>
    </div>
  );
}

function GenreFilter({
  genreFilter,
  setGenreFilter,
}: {
  genreFilter: Genre | "all";
  setGenreFilter: (g: Genre | "all") => void;
}) {
  const base =
    "rounded-full px-3 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950";
  const active =
    "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900";
  const inactive =
    "bg-zinc-200/80 text-zinc-700 hover:bg-zinc-300/80 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:bg-zinc-700/80";

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => setGenreFilter("all")}
        className={`${base} ${genreFilter === "all" ? active : inactive}`}
      >
        All
      </button>
      {GENRE_VALUES.map((g) => (
        <button
          key={g}
          type="button"
          onClick={() => setGenreFilter(g)}
          className={`${base} ${genreFilter === g ? active : inactive}`}
        >
          {genreLabels[g]}
        </button>
      ))}
    </div>
  );
}

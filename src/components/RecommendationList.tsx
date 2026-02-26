"use client";

import { Fragment, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { usePaginatedQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  RECOMMENDATIONS_PAGE_SIZE,
  UNAUTH_RECOMMENDATIONS_LIMIT,
} from "@/lib/recommendation-constants";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { getPublicMetadataRole } from "@/lib/clerk-utils";
import { genreLabels, type Genre } from "@/lib/genres";
import { Role } from "@/lib/roles";
import { GenreFilter } from "./GenreFilter";
import { RecommendationCard } from "./RecommendationCard";

function isLoadingFirstPage(
  status: string
): status is "LoadingFirstPage" {
  return status === "LoadingFirstPage";
}

function isGenre(value: Genre | "all"): value is Genre {
  return value !== "all";
}

export function RecommendationList() {
  const { user } = useUser();
  const [genreFilter, setGenreFilter] = useState<Genre | "all">("all");

  const { results, status, loadMore } = usePaginatedQuery(
    api.recommendations.listPaginated,
    {
      genre: user && genreFilter !== "all" ? genreFilter : undefined,
    },
    {
      initialNumItems: user
        ? RECOMMENDATIONS_PAGE_SIZE
        : UNAUTH_RECOMMENDATIONS_LIMIT,
    }
  );

  const { sentinelRef, sentinelIndex } = useInfiniteScroll({
    items: results ?? [],
    hasMore: status === "CanLoadMore",
    isLoading:
      status === "LoadingMore" || status === "LoadingFirstPage",
    loadMore,
    pageSize: user ? RECOMMENDATIONS_PAGE_SIZE : UNAUTH_RECOMMENDATIONS_LIMIT,
  });

  const currentUserId = user?.id ?? null;
  const isAdmin = getPublicMetadataRole(user?.publicMetadata) === Role.ADMIN;

  const items = useMemo(
    () =>
      results?.map((rec) => ({
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
    [results]
  );

  const showGenreFilter = !!user;

  return (
    <div className="space-y-4">
      {showGenreFilter && (
        <GenreFilter
          genreFilter={genreFilter}
          setGenreFilter={setGenreFilter}
        />
      )}

      {isLoadingFirstPage(status) && (
        <div className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Loading recommendations…
        </div>
      )}

      {!isLoadingFirstPage(status) &&
        items.length === 0 && (
          <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {!showGenreFilter || !isGenre(genreFilter)
              ? "No recommendations yet. Sign in to add yours!"
              : `No recommendations in ${genreLabels[genreFilter]} yet.`}
          </p>
        )}

      {!isLoadingFirstPage(status) && items.length > 0 && (
        <ul className="flex flex-col gap-4">
          {items.map((rec, i) => (
            <Fragment key={rec.id}>
              {i === sentinelIndex && (
                <div ref={sentinelRef} aria-hidden className="h-1" />
              )}
              <li>
                <RecommendationCard
                  rec={rec}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                />
              </li>
            </Fragment>
          ))}
        </ul>
      )}
    </div>
  );
}

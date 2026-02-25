"use client";

import { useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { RecommendationCard } from "./RecommendationCard";

export function RecommendationList() {
  const { user } = useUser();
  const recs = useQuery(api.recommendations.list);

  const currentUserId = user?.id ?? null;
  const isAdmin =
    (user?.publicMetadata?.role as string | undefined) === "admin";

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
      <div className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Loading recommendations…
      </div>
    );
  }

  if (recs.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        No recommendations yet. Sign in to add yours!
      </p>
    );
  }

  return (
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
  );
}

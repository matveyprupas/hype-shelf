"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { RecommendationCard } from "./RecommendationCard";

export function RecommendationList() {
  const recs = useQuery(api.recommendations.list);

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
      {recs.map((rec) => (
        <li key={rec.id}>
          <RecommendationCard
            rec={{
              id: rec.id,
              title: rec.title,
              genre: rec.genre,
              link: rec.link,
              blurb: rec.blurb,
              addedBy: rec.addedBy,
              isStaffPick: rec.isStaffPick,
              createdAt: new Date(rec.createdAt).toISOString(),
            }}
          />
        </li>
      ))}
    </ul>
  );
}

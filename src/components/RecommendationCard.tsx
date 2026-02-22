import type { Recommendation } from "@/lib/types";

interface RecommendationCardProps {
  rec: Recommendation;
}

function formatGenre(genre: string): string {
  return genre
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

export function RecommendationCard({ rec }: RecommendationCardProps) {
  return (
    <article className="group rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {formatGenre(rec.genre)}
          </span>
          {rec.isStaffPick && (
            <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
              Staff Pick
            </span>
          )}
        </div>
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
          <a
            href={rec.link}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 hover:underline"
          >
            {rec.title}
          </a>
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{rec.blurb}</p>
        {rec.addedBy && (
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            Added by {rec.addedBy}
          </p>
        )}
      </div>
    </article>
  );
}

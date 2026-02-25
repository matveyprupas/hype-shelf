"use client";

import { memo, useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { genreLabels } from "@/lib/genres";
import type { Recommendation } from "@/lib/types";
import { ConfirmModal } from "./ConfirmModal";

interface RecommendationCardProps {
  rec: Recommendation;
  /** Current user's Clerk ID – present when signed in */
  currentUserId?: string | null;
  /** True when user has admin role (from Clerk publicMetadata.role) */
  isAdmin?: boolean;
}

function RecommendationCardComponent({
  rec,
  currentUserId,
  isAdmin,
}: RecommendationCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const remove = useMutation(api.recommendations.remove);
  const toggleStaffPick = useMutation(api.recommendations.toggleStaffPick);

  const canDelete = Boolean(
    currentUserId && (isAdmin || rec.userId === currentUserId)
  );
  const canToggleStaffPick = Boolean(isAdmin);

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!canDelete) return;
      setShowDeleteConfirm(true);
    },
    [canDelete]
  );

  const handleDeleteConfirm = useCallback(async () => {
    try {
      await remove({ id: rec.id });
      setShowDeleteConfirm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  }, [rec.id, remove]);

  const handleToggleStaffPick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!canToggleStaffPick) return;
      try {
        await toggleStaffPick({ id: rec.id });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update");
      }
    },
    [canToggleStaffPick, rec.id, toggleStaffPick]
  );

  return (
    <article className="group rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              {genreLabels[rec.genre] ?? rec.genre}
            </span>
            {rec.isStaffPick && (
              <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                Staff Pick
              </span>
            )}
          </div>
          {(canDelete || canToggleStaffPick) && (
            <div className="flex items-center gap-1">
              {canToggleStaffPick && (
                <button
                  type="button"
                  onClick={handleToggleStaffPick}
                  className="rounded p-1.5 text-zinc-500 hover:bg-amber-100 hover:text-amber-700 dark:hover:bg-amber-900/30 dark:hover:text-amber-400"
                  title={
                    rec.isStaffPick ? "Remove Staff Pick" : "Mark as Staff Pick"
                  }
                  aria-label={
                    rec.isStaffPick ? "Remove Staff Pick" : "Mark as Staff Pick"
                  }
                >
                  <Star
                    className="h-4 w-4"
                    fill={rec.isStaffPick ? "currentColor" : "none"}
                    stroke="currentColor"
                  />
                </button>
              )}
              {canDelete && (
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="rounded p-1.5 text-zinc-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                  title="Delete"
                  aria-label="Delete recommendation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
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
      <ConfirmModal
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete recommendation"
        description="Are you sure you want to delete this recommendation?"
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        destructive
      />
    </article>
  );
}

export const RecommendationCard = memo(RecommendationCardComponent);

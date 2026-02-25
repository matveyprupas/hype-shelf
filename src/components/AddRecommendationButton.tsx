"use client";

import { useState } from "react";
import { AddRecommendationModal } from "./AddRecommendationModal";

export function AddRecommendationButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center gap-8">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Add a recommendation by clicking the button below.
        </p>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-offset-zinc-950"
          aria-label="Add your recommendation"
        >
          Add your recommendation
        </button>
      </div>
      <AddRecommendationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

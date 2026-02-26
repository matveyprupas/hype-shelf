import { GENRE_VALUES, genreLabels, type Genre } from "@/lib/genres";

interface GenreFilterProps {
  genreFilter: Genre | "all";
  setGenreFilter: (g: Genre | "all") => void;
}

export function GenreFilter({ genreFilter, setGenreFilter }: GenreFilterProps) {
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

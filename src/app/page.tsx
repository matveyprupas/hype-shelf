import { RecommendationCard } from "@/components/RecommendationCard";
import { MOCK_RECOMMENDATIONS } from "@/lib/mock-data";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
            HypeShelf
          </h1>
          <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
            Collect and share the stuff you&apos;re hyped about.
          </p>
        </header>

        {/* Sign in CTA – mocked for now */}
        <div className="mb-10 flex justify-center">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-offset-zinc-950"
            aria-label="Sign in to add your recommendation"
          >
            Sign in to add yours
          </button>
        </div>

        {/* Latest recommendations – read-only list */}
        <section>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Latest recommendations
          </h2>
          <ul className="flex flex-col gap-4">
            {MOCK_RECOMMENDATIONS.map((rec) => (
              <li key={rec.id}>
                <RecommendationCard rec={rec} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

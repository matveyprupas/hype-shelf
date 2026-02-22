import type { Recommendation } from "./types";

/**
 * Mock recommendations for the public page.
 * Replace with Convex query once backend is wired up.
 */
export const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: "1",
    title: "Everything Everywhere All at Once",
    genre: "sci-fi",
    link: "https://www.imdb.com/title/tt6710474/",
    blurb: "Mind-bending multiverse action with heart. Michelle Yeoh absolutely owns it.",
    addedBy: "Alex",
    isStaffPick: true,
    createdAt: "2025-02-20T14:00:00Z",
  },
  {
    id: "2",
    title: "The Bear",
    genre: "drama",
    link: "https://www.imdb.com/title/tt14452776/",
    blurb: "Intense kitchen drama. Best show about cooking and chaos.",
    addedBy: "Jordan",
    createdAt: "2025-02-19T10:30:00Z",
  },
  {
    id: "3",
    title: "Talk to Me",
    genre: "horror",
    link: "https://www.imdb.com/title/tt10638522/",
    blurb: "Fresh take on possession horror. Genuinely unsettling.",
    addedBy: "Sam",
    createdAt: "2025-02-18T18:45:00Z",
  },
  {
    id: "4",
    title: "Poor Things",
    genre: "comedy",
    link: "https://www.imdb.com/title/tt14230458/",
    blurb: "Wild, weird, and wonderful. Emma Stone at her finest.",
    addedBy: "Taylor",
    isStaffPick: true,
    createdAt: "2025-02-17T09:15:00Z",
  },
  {
    id: "5",
    title: "Dune: Part Two",
    genre: "action",
    link: "https://www.imdb.com/title/tt15239678/",
    blurb: "Epic scale, stunning visuals. Must see on the biggest screen.",
    addedBy: "Casey",
    createdAt: "2025-02-16T20:00:00Z",
  },
];

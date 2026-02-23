import { Genre } from "@/lib/types";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** Public list – returns addedBy only for authenticated users (hides from unauth) */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const recs = await ctx.db.query("recommendations").order("desc").take(50);

    return recs.map((rec) => {
      const item: {
        id: string;
        title: string;
        genre: Genre;
        link: string;
        blurb: string;
        addedBy?: string;
        isStaffPick?: boolean;
        createdAt: number;
      } = {
        id: rec._id as string,
        title: rec.title,
        genre: rec.genre as Genre,
        link: rec.link,
        blurb: rec.blurb,
        isStaffPick: rec.isStaffPick,
        createdAt: rec._creationTime,
      };
      if (identity) {
        item.addedBy = rec.addedBy;
      }
      return item;
    });
  },
});

const seedData = [
  {
    title: "Everything Everywhere All at Once",
    genre: Genre.SCI_FI,
    link: "https://www.imdb.com/title/tt6710474/",
    blurb:
      "Mind-bending multiverse action with heart. Michelle Yeoh absolutely owns it.",
    userId: "seed_alex",
    addedBy: "Alex",
    isStaffPick: true,
  },
  {
    title: "The Bear",
    genre: Genre.DRAMA,
    link: "https://www.imdb.com/title/tt14452776/",
    blurb: "Intense kitchen drama. Best show about cooking and chaos.",
    userId: "seed_jordan",
    addedBy: "Jordan",
  },
  {
    title: "Talk to Me",
    genre: Genre.HORROR,
    link: "https://www.imdb.com/title/tt10638522/",
    blurb: "Fresh take on possession horror. Genuinely unsettling.",
    userId: "seed_sam",
    addedBy: "Sam",
  },
  {
    title: "Poor Things",
    genre: Genre.COMEDY,
    link: "https://www.imdb.com/title/tt14230458/",
    blurb: "Wild, weird, and wonderful. Emma Stone at her finest.",
    userId: "seed_taylor",
    addedBy: "Taylor",
    isStaffPick: true,
  },
  {
    title: "Dune: Part Two",
    genre: Genre.ACTION,
    link: "https://www.imdb.com/title/tt15239678/",
    blurb: "Epic scale, stunning visuals. Must see on the biggest screen.",
    userId: "seed_casey",
    addedBy: "Casey",
  },
];

/** One-time seed – run from Dashboard or CLI to populate initial data */
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("recommendations").first();
    if (existing) {
      return { seeded: 0, message: "Data already exists, skipping seed" };
    }
    for (const rec of seedData) {
      await ctx.db.insert("recommendations", rec);
    }
    return { seeded: seedData.length };
  },
});

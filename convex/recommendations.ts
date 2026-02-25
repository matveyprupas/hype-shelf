import {
  BLURB_MAX,
  TITLE_MAX,
  URL_PATTERN,
} from "@/lib/recommendation-validation";
import { Genre } from "@/lib/types";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { UserIdentity } from "convex/server";

const GENRE_VALUES = [
  "horror",
  "action",
  "comedy",
  "drama",
  "sci-fi",
  "documentary",
  "animation",
  "thriller",
  "other",
] as const;

const genreValidator = v.union(...GENRE_VALUES.map((g) => v.literal(g)));

/** Create a recommendation – auth required, validated inputs */
export const create = mutation({
  args: {
    title: v.string(),
    genre: genreValidator,
    link: v.string(),
    blurb: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = (await ctx.auth.getUserIdentity()) as
      | (UserIdentity & {
          userId: string;
          fullName: string;
        })
      | null;

    console.log("identity", identity);

    if (!identity) {
      throw new Error("You must be signed in to add a recommendation.");
    }

    const title = args.title.trim();
    if (!title) {
      throw new Error("Title is required.");
    }
    if (title.length > TITLE_MAX) {
      throw new Error(`Title must be at most ${TITLE_MAX} characters.`);
    }

    const blurb = args.blurb.trim();
    if (!blurb) {
      throw new Error("Blurb is required.");
    }
    if (blurb.length > BLURB_MAX) {
      throw new Error(`Blurb must be at most ${BLURB_MAX} characters.`);
    }

    const link = args.link.trim();
    if (!link) {
      throw new Error("Link is required.");
    }
    if (!URL_PATTERN.test(link)) {
      throw new Error("Link must be a valid URL (e.g. https://…).");
    }

    const addedBy = identity.fullName ?? identity.userId ?? "unknown user";
    await ctx.db.insert("recommendations", {
      title,
      genre: args.genre,
      link,
      blurb,
      userId: identity.subject,
      addedBy,
    });
  },
});

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

import {
  BLURB_MAX,
  TITLE_MAX,
  URL_PATTERN,
} from "@/lib/recommendation-validation";
import { Genre } from "@/lib/genres";
import type { Id } from "./_generated/dataModel";
import { type ClerkIdentity, getAuthenticatedIdentity } from "./lib/auth";
import { genreValidator } from "./lib/genres";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Admin check – requires Clerk JWT to include role claim.
 * In Clerk Dashboard → JWT Templates → Convex: add claim "role": "{{user.public_metadata.role}}"
 * Then set user's public_metadata.role = "admin" for admin users.
 */
function isAdmin(identity: ClerkIdentity): boolean {
  return identity.metadata?.role === "admin";
}

/** Create a recommendation – auth required, validated inputs */
export const create = mutation({
  args: {
    title: v.string(),
    genre: genreValidator,
    link: v.string(),
    blurb: v.string(),
  },

  handler: async (ctx, args) => {
    const identity = getAuthenticatedIdentity(
      await ctx.auth.getUserIdentity(),
      "You must be signed in to add a recommendation."
    );

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

    const addedBy =
      identity.fullName ?? identity.name ?? identity.subject ?? "unknown user";
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

/** Delete a recommendation – admin can delete any, user can delete only own */
export const remove = mutation({
  args: { id: v.id("recommendations") },
  handler: async (ctx, args) => {
    const identity = getAuthenticatedIdentity(
      await ctx.auth.getUserIdentity(),
      "You must be signed in to delete a recommendation."
    );

    const rec = await ctx.db.get(args.id);
    if (!rec) {
      throw new Error("Recommendation not found.");
    }

    const admin = isAdmin(identity);
    const isOwner = rec.userId === identity.subject;

    if (!admin && !isOwner) {
      throw new Error("You can only delete your own recommendations.");
    }

    await ctx.db.delete(args.id);
  },
});

/** Toggle Staff Pick – admin only */
export const toggleStaffPick = mutation({
  args: { id: v.id("recommendations") },
  handler: async (ctx, args) => {
    const identity = getAuthenticatedIdentity(
      await ctx.auth.getUserIdentity(),
      "You must be signed in."
    );
    if (!isAdmin(identity)) {
      throw new Error("Only admins can mark Staff Picks.");
    }

    const rec = await ctx.db.get(args.id);
    if (!rec) {
      throw new Error("Recommendation not found.");
    }

    await ctx.db.patch(args.id, {
      isStaffPick: !rec.isStaffPick,
    });
  },
});

/** Public list – returns addedBy and userId only for authenticated users (hides from unauth) */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const recs = await ctx.db.query("recommendations").order("desc").take(50);

    return recs.map((rec) => {
      const item: {
        id: Id<"recommendations">;
        title: string;
        genre: Genre;
        link: string;
        blurb: string;
        addedBy?: string;
        userId?: string;
        isStaffPick?: boolean;
        createdAt: number;
      } = {
        id: rec._id,
        title: rec.title,
        genre: rec.genre,
        link: rec.link,
        blurb: rec.blurb,
        isStaffPick: rec.isStaffPick,
        createdAt: rec._creationTime,
      };
      if (identity) {
        item.addedBy = rec.addedBy;
        item.userId = rec.userId;
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

import { UNAUTH_RECOMMENDATIONS_LIMIT } from "@/lib/recommendation-constants";
import {
  BLURB_MAX,
  TITLE_MAX,
  URL_PATTERN,
} from "@/lib/recommendation-validation";
import { Genre } from "@/lib/genres";
import type { Id } from "./_generated/dataModel";
import { requireAdmin, requireOwnerOrAdmin, requireSignedIn } from "./lib/auth";
import { genreValidator } from "./lib/genres";
import { internalMutation, mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

/** Create a recommendation – auth required, validated inputs */
export const create = mutation({
  args: {
    title: v.string(),
    genre: genreValidator,
    link: v.string(),
    blurb: v.string(),
  },

  handler: async (ctx, args) => {
    const identity = requireSignedIn(
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
    const identity = requireSignedIn(
      await ctx.auth.getUserIdentity(),
      "You must be signed in to delete a recommendation."
    );

    const rec = await ctx.db.get(args.id);
    if (!rec) {
      throw new Error("Recommendation not found.");
    }

    requireOwnerOrAdmin({
      identity,
      ownerId: rec.userId,
      errorMessage: "You can only delete your own recommendations.",
    });

    await ctx.db.delete(args.id);
  },
});

/** Toggle Staff Pick – admin only */
export const toggleStaffPick = mutation({
  args: { id: v.id("recommendations") },
  handler: async (ctx, args) => {
    const identity = requireSignedIn(await ctx.auth.getUserIdentity());
    requireAdmin(identity, "Only admins can mark Staff Picks.");

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
  args: {
    genre: v.optional(genreValidator),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const limit = identity ? 50 : 3;
    const genre = args.genre;
    const useGenreFilter = identity !== null && genre !== undefined;

    const recs = useGenreFilter
      ? await ctx.db
          .query("recommendations")
          .withIndex("by_genre", (q) => q.eq("genre", genre))
          .order("desc")
          .take(limit)
      : await ctx.db.query("recommendations").order("desc").take(limit);

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

/** Paginated list for infinite scroll – PAGE_SIZE for auth users, 3 max for unauth */
export const listPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
    genre: v.optional(genreValidator),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const genre = args.genre;
    const useGenreFilter = identity !== null && genre !== undefined;

    const baseQuery = useGenreFilter
      ? ctx.db
          .query("recommendations")
          .withIndex("by_genre", (q) => q.eq("genre", genre))
          .order("desc")
      : ctx.db.query("recommendations").order("desc");

    const isUnauth = identity === null;
    const opts = args.paginationOpts;

    if (isUnauth) {
      if (opts.cursor !== null) {
        return {
          page: [],
          isDone: true,
          continueCursor: "",
        };
      }
      const paginationOpts = {
        numItems: UNAUTH_RECOMMENDATIONS_LIMIT,
        cursor: null as string | null,
      };
      const result = await baseQuery.paginate(paginationOpts);
      return {
        ...result,
        page: result.page.map((rec) => {
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
          return item;
        }),
        isDone: true,
        continueCursor: "",
      };
    }

    const result = await baseQuery.paginate(opts);

    return {
      ...result,
      page: result.page.map((rec) => {
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
      }),
    };
  },
});

type SeedRecommendation = {
  title: string;
  genre: Genre;
  link: string;
  blurb: string;
  userId: string;
  addedBy: string;
  isStaffPick?: boolean;
};

const seedTitleAdjectives = [
  "Midnight",
  "Electric",
  "Crimson",
  "Hidden",
  "Silent",
  "Neon",
  "Golden",
  "Frozen",
  "Shadow",
  "Broken",
];

const seedTitleNouns = [
  "Archive",
  "Signal",
  "Voyage",
  "Protocol",
  "Legacy",
  "Labyrinth",
  "Frontier",
  "Paradox",
  "Echo",
  "Odyssey",
];

const seedFormats = [
  "Movie",
  "Series",
  "Documentary",
  "Special",
  "Mini-Series",
];

const seedBlurbs = [
  "Unexpectedly emotional and easy to binge.",
  "Sharp writing, great pacing, and memorable characters.",
  "A stylish pick with a surprisingly thoughtful finale.",
  "Delivers exactly what the premise promises.",
  "Perfect for a weekend watch with friends.",
  "Balances spectacle and story better than expected.",
];

const seedContributors = [
  "Alex",
  "Jordan",
  "Taylor",
  "Casey",
  "Riley",
  "Sam",
  "Morgan",
  "Avery",
];

function generateSeedRecommendations(
  count: number,
  startAt = 0
): SeedRecommendation[] {
  return Array.from({ length: count }, (_, index) => {
    const itemNumber = startAt + index + 1;
    const adjective = seedTitleAdjectives[index % seedTitleAdjectives.length];
    const noun = seedTitleNouns[(index * 3) % seedTitleNouns.length];
    const format = seedFormats[(index * 5) % seedFormats.length];
    const genre = Object.values(Genre)[index % Object.values(Genre).length];
    const addedBy = seedContributors[index % seedContributors.length];
    const title = `${adjective} ${noun} ${format} ${itemNumber}`;
    const blurb = `${seedBlurbs[index % seedBlurbs.length]} Seeded mock recommendation #${itemNumber}.`;

    return {
      title,
      genre,
      link: `https://example.com/hype-shelf/recommendation/${itemNumber}`,
      blurb,
      userId: `seed_user_${(index % seedContributors.length) + 1}`,
      addedBy,
      ...(index % 10 === 0 ? { isStaffPick: true } : {}),
    };
  });
}

/** One-time seed – run from Dashboard or CLI to populate initial data */
export const seed = mutation({
  args: {
    count: v.optional(v.number()),
    append: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = requireSignedIn(await ctx.auth.getUserIdentity());
    requireAdmin(identity, "Only admins can seed recommendations.");

    const count = args.count ?? 150;
    if (!Number.isInteger(count) || count <= 0 || count > 500) {
      throw new Error("count must be an integer between 1 and 500.");
    }

    const existing = await ctx.db.query("recommendations").collect();
    const existingCount = existing.length;
    const shouldAppend = args.append ?? false;

    if (!shouldAppend && existingCount > 0) {
      return {
        seeded: 0,
        existingCount,
        message:
          "Data already exists. Re-run with append=true to add more mock records.",
      };
    }

    const seedData = generateSeedRecommendations(
      count,
      shouldAppend ? existingCount : 0
    );

    for (const rec of seedData) {
      await ctx.db.insert("recommendations", rec);
    }

    return {
      seeded: seedData.length,
      existingCount,
      totalAfter: existingCount + seedData.length,
      mode: shouldAppend ? "append" : "initial",
    };
  },
});

/** CLI/internal seed – intended for `convex run internal.recommendations:seedInternal` */
export const seedInternal = internalMutation({
  args: {
    count: v.optional(v.number()),
    append: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const count = args.count ?? 150;
    if (!Number.isInteger(count) || count <= 0 || count > 500) {
      throw new Error("count must be an integer between 1 and 500.");
    }

    const existing = await ctx.db.query("recommendations").collect();
    const existingCount = existing.length;
    const shouldAppend = args.append ?? false;

    if (!shouldAppend && existingCount > 0) {
      return {
        seeded: 0,
        existingCount,
        message:
          "Data already exists. Re-run with append=true to add more mock records.",
      };
    }

    const seedData = generateSeedRecommendations(
      count,
      shouldAppend ? existingCount : 0
    );

    for (const rec of seedData) {
      await ctx.db.insert("recommendations", rec);
    }

    return {
      seeded: seedData.length,
      existingCount,
      totalAfter: existingCount + seedData.length,
      mode: shouldAppend ? "append" : "initial",
    };
  },
});

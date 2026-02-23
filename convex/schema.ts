import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  recommendations: defineTable({
    title: v.string(),
    genre: v.string(),
    link: v.string(),
    blurb: v.string(),
    /** Clerk user ID – used for ownership checks */
    userId: v.string(),
    /** Display name stored at creation (for "Added by X") */
    addedBy: v.string(),
    isStaffPick: v.optional(v.boolean()),
  })
    .index("by_genre", ["genre"])
    .index("by_user", ["userId"]),
});

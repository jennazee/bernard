import { defineSchema, defineTable, s } from "convex/schema";

// first, last, age, gender, party, address, city, zip, voter_id
export default defineSchema({
  voters: defineTable({
    Born: s.number(),
    City: s.string(),
    County: s.string(),
    First: s.string(),
    Last: s.string(),
    Middle: s.string(),
    Street: s.string(),
    state_file_id: s.number(),
  })
  .index("by_first", ["First"])
  .index("by_last", ["Last"])
  .index("by_first_last", ["First", "Last"])
  .index("by_last_first", ["Last", "First"]),
});
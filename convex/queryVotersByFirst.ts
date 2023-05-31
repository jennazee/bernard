import { query } from "./_generated/server";

export default query(async ({ db }, { searchQuery }) => {
  const voters = await db.query("voters").withSearchIndex("search_first", q => q.search("First", searchQuery)).collect();
  return voters;
});

import { mutation } from "./_generated/server";

export default mutation(async ({ db }, { email, savedVoters }) => {
  savedVoters.forEach((voter) => {
    db.insert("saved_voters", {user_email: email, ...voter});
  })
});
import { query } from "./_generated/server";

export default query(async ({ db }, { firstNameQuery, lastNameQuery }) => {
    const normalizedFirstQuery = normalizeQuery(firstNameQuery);
    const normalizedLastQuery = normalizeQuery(lastNameQuery);

    if (normalizedFirstQuery.length + normalizedLastQuery.length < 3) return [];

    if (normalizedFirstQuery.length >= 3 && !normalizedLastQuery.length) {
        const voters = await db.query("voters")
            .withIndex("by_first", q =>
            q
                .gte("First", normalizedFirstQuery)
                .lt("First", getTopBoundForQuery(normalizedFirstQuery))
        )
        .take(8192);
        return voters;
    }

    if (!normalizedFirstQuery.length && normalizedLastQuery.length >= 3) {
        const voters = await db.query("voters")
            .withIndex("by_last", q =>
            q
                .gte("Last", normalizedLastQuery)
                .lt("Last", getTopBoundForQuery(normalizedLastQuery))
        )
        .take(8192);
        return voters;
    }

    if (normalizedFirstQuery.length + normalizedLastQuery.length >= 3) {
        const voters = await db.query("voters")
            .withIndex("by_first_last", q =>
                q
                .gte("First", normalizedFirstQuery)
                .lt("First", getTopBoundForQuery(normalizedFirstQuery))
            )
            .filter(q => q.gte(q.field("Last"), normalizedLastQuery))
            .filter(q => q.lt(q.field("Last"), getTopBoundForQuery(normalizedLastQuery)))
            .take(8192);
        return voters;
    }
});

const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

function getTopBoundForQuery(queryString: string) {
    const lastIndex = letters.indexOf(queryString[queryString.length - 1]);
    const topBound = queryString.slice(0, -1) + letters[lastIndex + 1];
    return topBound;
}

function normalizeQuery(query: string) {
    if (!query.length) return ''
    return query[0].toUpperCase() + query.slice(1).trim()
}

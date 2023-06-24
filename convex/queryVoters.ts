import { query } from "./_generated/server";

const E_TOO_MANY_RESULTS = 'There were too many results. Please narrow your query.'

export default query(async ({ db }, { firstNameQuery, lastNameQuery }) => {
    const normalizedFirstQuery = normalizeQuery(firstNameQuery);
    const normalizedLastQuery = normalizeQuery(lastNameQuery);

    // if we only have a first name
    if (normalizedFirstQuery.length >= 3 && !normalizedLastQuery.length) {
        try {
            const voters = await db.query("voters")
            .withIndex("by_first", q =>
            q
                .gte("First", normalizedFirstQuery)
                .lt("First", getTopBoundForQuery(normalizedFirstQuery))
            )
            .take(8192);
            return {results: voters, status: 'ok'};
        } catch (error) {
            return {results: [], status: 'error', message: E_TOO_MANY_RESULTS};
        }
    }

    // if we only have a first name
    if (!normalizedFirstQuery.length && normalizedLastQuery.length >= 3) {
        try {
            const voters = await db.query("voters")
                .withIndex("by_last", q =>
                q
                    .gte("Last", normalizedLastQuery)
                    .lt("Last", getTopBoundForQuery(normalizedLastQuery))
            )
            .take(8192);
            return {results: voters, status: 'ok'};
        } catch (error) {
            return {results: [], status: 'error', message: E_TOO_MANY_RESULTS};
        }
    }

    if (normalizedFirstQuery.length + normalizedLastQuery.length >= 3) {
    try {
        console.log('Searching for voters first > last for query', normalizedFirstQuery, normalizedLastQuery)
        const voters = await db.query("voters")
            .withIndex("by_first", q =>
                q
                .gte("First", normalizedFirstQuery)
                .lt("First", getTopBoundForQuery(normalizedFirstQuery))
            )
            .filter(q => q.gte(q.field("Last"), normalizedLastQuery))
            .filter(q => q.lt(q.field("Last"), getTopBoundForQuery(normalizedLastQuery)))
            .take(8192);
            return {results: voters, status: 'ok'};
        } catch (error) {
            console.log('Searching for voters last > first for query', normalizedFirstQuery, normalizedLastQuery)
            try {
                const voters = await db.query("voters")
                .withIndex("by_last", q =>
                    q
                    .gte("Last", normalizedLastQuery)
                    .lt("Last", getTopBoundForQuery(normalizedLastQuery))
                )
                .filter(q => q.gte(q.field("First"), normalizedFirstQuery))
                .filter(q => q.lt(q.field("First"), getTopBoundForQuery(normalizedFirstQuery)))
                .take(8192);
                return {results: voters, status: 'ok'};
            } catch (error) {
                return {results: [], status: 'error', message: E_TOO_MANY_RESULTS};
            }
        }
    }

    return {results: [], status: 'error', message: E_TOO_MANY_RESULTS};
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

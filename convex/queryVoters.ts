import { query } from "./_generated/server";

const TOO_MANY_RESULTS_RESPONSE = {results: [], status: 'error', message: 'There were too many results. Please narrow your query.'};
const QUERY_TOO_SHORT_RESPONSE = {results: [], status: 'error', message: 'Please try a longer query'};
const UNKNOWN_ERROR_RESPONSE = {results: [], status: 'error', message: "We can't seem to get results for this query. Please try another query, or searching for just first or just last name"};

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
            console.error(error)
            return TOO_MANY_RESULTS_RESPONSE;
        }
    }

    // if we only have a last name
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
            console.error(error)
            return TOO_MANY_RESULTS_RESPONSE;
        }
    }

    if (normalizedFirstQuery.length + normalizedLastQuery.length >= 3) {
    try {
        console.log(`Searching for voters first > last for query ${normalizedFirstQuery} ${normalizedLastQuery}`)
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
            console.log(`Searching for voters last > first for query for ${normalizedFirstQuery} ${normalizedLastQuery}`)
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
                console.log(`Trying an exact match query on first_last for ${normalizedFirstQuery} ${normalizedLastQuery}`)
                try {
                    const voters = await db.query("voters")
                    .withIndex("by_first_last", q =>
                        q
                        .eq("First", normalizedFirstQuery)
                        .eq("Last", normalizedLastQuery)
                    )
                    .take(8192);
                    return {results: voters, status: 'ok'};
                } catch (error) {
                    console.log(`Trying an exact match query on last_first for ${normalizedFirstQuery} ${normalizedLastQuery}`)
                    try {
                        const voters = await db.query("voters")
                        .withIndex("by_last_first", q =>
                            q
                            .eq("Last", normalizedFirstQuery)
                            .eq("First", normalizedLastQuery)
                        )
                        .take(8192);
                        return {results: voters, status: 'ok'};
                    } catch (error) {
                        console.error(error);
                        return UNKNOWN_ERROR_RESPONSE;
                    }
                }
            }
        }
    }

    return QUERY_TOO_SHORT_RESPONSE;
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

import * as csv from "csvtojson";
import { voters } from './voters.js';
import { deburr } from 'lodash';

function processVoterData() {
    return csv.csv().fromString(voters)
        .then((json) => {
            return json;
        });
};

function search({ query, voters }) {
    if (query.length < 3) return [];

    const fields = Object.keys(voters[0]);
    const numVoters = voters.length;
    const numFields = fields.length;
    const matches = [];

    const normalizedQuery = normalizeString(query);

    for (let i = 0; i < numVoters; i++) {
        const voter = voters[i];
        for (let j = 0; j < numFields; j++) {
            const field = fields[j];
            if (normalizeString(voter[field]).indexOf(normalizedQuery) !== -1) {
                matches.push(voter);
                break;
            }
        }
    }

    return matches;
}

function renderResults(results) {
    if (!results.length) return '';

    return `
    <thead class="Results-header">
        <tr>${Object.keys(results[0]).map((key) => `<th class="Results-header_cell">${key}</th>`).join('')}</tr>
    </thead>
    <tbody>
        ${results.map((result) => `<tr class="Results-row">${Object.values(result).map((value) => `<td class="Results-row_cell">${value}</td>`).join('')}</tr>`).join('')}
    </tbody>
    `
}

function normalizeString(string) {
    return deburr(string.toLocaleLowerCase());
}

function init() {
    processVoterData().then((voters) => {
        document.querySelector('.Wrapper--loading').classList.remove('Wrapper--loading');
        document.querySelector('[data-js="input"]').addEventListener('keyup', (e) => {
            document.querySelector('[data-js="results"]').innerHTML = renderResults(search({ query: e.target.value, voters }));
        });
    })
}



init();




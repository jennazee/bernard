import * as csv from "csvtojson";
import { voters } from './voters.js';
import { deburr } from 'lodash';

const FIRST_NAME = 'First';
const LAST_NAME = 'Last';
const ADDRESS = 'Address';
const CITY = 'City';
const ZIP = 'Zip';
const VOTERID = 'Voter id';

function processVoterData() {
    return csv.csv().fromString(voters)
        .then((json) => {
            return json;
        });
};

function queryMatchesVoterField({ normalizedQuery, voter, field }) {
    return normalizeString(voter[field]).indexOf(normalizedQuery) !== -1;
}

function searchByName({ query, voters }) {
    if (query.length < 3) return [];

    const fields = Object.keys(voters[0]);
    const numVoters = voters.length;
    const matches = [];

    const normalizedQuery = normalizeString(query);

    for (let i = 0; i < numVoters; i++) {
        const voter = voters[i];

        if (queryMatchesVoterField({ normalizedQuery, voter, field: FIRST_NAME }) || queryMatchesVoterField({ normalizedQuery, voter, field: LAST_NAME })) {
            matches.push(voter);
        }
    }

    return matches;
}

function searchByAddress({ query, voters }) {
    if (query.length < 3) return [];

    const fields = Object.keys(voters[0]);
    const numVoters = voters.length;
    const matches = [];

    const normalizedQuery = normalizeString(query);

    for (let i = 0; i < numVoters; i++) {
        const voter = voters[i];

        if (queryMatchesVoterField({ normalizedQuery, voter, field: ADDRESS }) || queryMatchesVoterField({ normalizedQuery, voter, field: CITY }) || queryMatchesVoterField({ normalizedQuery, voter, field: ZIP })) {
            matches.push(voter);
        }
    }

    return matches;
}

function renderResults(results) {
    if (!results.length) return '';

    return `
    <thead class="Results-header">
        <tr><th class="Results-header_cell"></th>${Object.keys(results[0]).filter((value) => value !== 'isSelected').map((key) => `<th class="Results-header_cell">${key}</th>`).join('')}</tr>
    </thead>
    <tbody>
        ${results.map((result) => `<tr class="Results-row"><td class="Results-row_cell"><input type="checkbox" data-id="${result[VOTERID]}" ${result.isSelected ? 'checked' : ''}></td>${Object.keys(result).filter((value) => value !== 'isSelected').map((key) => `<td class="Results-row_cell">${result[key]}</td>`).join('')}</tr>`).join('')}
    </tbody>
    `
}

function normalizeString(string) {
    return deburr(string.toLocaleLowerCase());
}

function exportResults(voters) {
    const selections = voters.filter((voter) => voter.isSelected).map((voter) => {
        delete voter.isSelected; return voter;
    });
    exportCSVFile(selections)
}

function convertToCSV(objArray) {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';

    for (let i = 0; i < array.length; i++) {
        let line = '';
        for (let index in array[i]) {
            if (line != '') line += ','
            line += array[i][index];
        }

        str += line + '\r\n';
    }

    return str;
}

function exportCSVFile(items) {
    const jsonObject = JSON.stringify(items);

    const csv = convertToCSV(jsonObject);

    const exportedFilename = 'voters.csv';

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, exportedFilename);
    } else {
        const link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", exportedFilename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

function init() {
    processVoterData().then((voters) => {
        let nameQuery = '';
        let addressQuery = '';

        document.querySelector('.Wrapper--loading').classList.remove('Wrapper--loading');
        document.querySelector('[data-js="input-name"]').addEventListener('keyup', (e) => {
            nameQuery = e.target.value;
            document.querySelector('[data-js="name-results"]').innerHTML = renderResults(searchByName({ query: nameQuery, voters }));
        });
        document.querySelector('[data-js="input-address"]').addEventListener('keyup', (e) => {
            addressQuery = e.target.value;
            document.querySelector('[data-js="address-results"]').innerHTML = renderResults(searchByAddress({ query: addressQuery, voters }));
        });
        document.querySelector('[data-js="name-results"]').addEventListener('change', (e) => {
            if (e.target.matches('input')) {
                const id = e.target.dataset.id;
                const voter = voters.find((v) => v[VOTERID] === id);
                if (e.target.checked) {
                    voter.isSelected = true;
                } else {
                    voter.isSelected = false;
                }

                document.querySelector('[data-js="address-results"]').innerHTML = renderResults(searchByAddress({ query: addressQuery, voters }));
            }
        });
        document.querySelector('[data-js="address-results"]').addEventListener('change', (e) => {
            if (e.target.matches('input')) {
                const id = e.target.dataset.id;
                const voter = voters.find((v) => v[VOTERID] === id);
                if (e.target.checked) {
                    voter.isSelected = true;
                } else {
                    voter.isSelected = false;
                }

                document.querySelector('[data-js="name-results"]').innerHTML = renderResults(searchByName({ query: nameQuery, voters }));
            }
        });
        document.querySelector('[data-js="export-button"]').addEventListener('click', (e) => {
            exportResults(voters);
        });
    });
}

init();




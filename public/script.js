/**
 * The frontend script that handles querying the database and getting the results.
 */
const saved = {};
let searchResults = [];
const idKey = "ID Number";

window.addEventListener("DOMContentLoaded", function () {
  document
    .querySelector(".Wrapper--loading")
    .classList.remove("Wrapper--loading");

  document
    .querySelector('[data-js="input-email"]')
    .addEventListener("keyup", (e) => {
      email = e.target.value;
      if (email.indexOf('@') > -1) {
        const hidden = document.querySelector(".SearchWrapper--hidden")
        if (hidden) hidden.classList.remove("SearchWrapper--hidden");
      }
    });
  
  document
    .querySelector('[data-js="search-button"]')
    .addEventListener("click", (e) => {
      nameQuery = document.querySelector('[data-js="input-name"]').value.trim();

      var req = new XMLHttpRequest();
      req.open("GET", `/query?name=${encodeURIComponent(nameQuery)}`, true);
      req.send();
      req.onload = function () {
        searchResults = JSON.parse(req.response);
        
        for (let i = 0; i < searchResults.length; i++) {
          if (saved[searchResults[i][idKey]]) {
            searchResults[i].isSelected = true;
          }
        }

        document.querySelector([
          '[data-js="name-results"]',
        ]).innerHTML = renderResults(searchResults);
      };
    });

  function onCheck(e) {
    if (e.target.matches("input")) {
      const id = e.target.dataset.id;
      const voter = searchResults.find((v) => v["ID Number"] === id);
      voter.isSelected = true;
      if (e.target.checked) {
        saved[id] = voter;
        voter.isSelected = true;
      } else {
        delete saved[id];
        voter.isSelected = false;
      }
    }

    document.querySelector([
      '[data-js="saved-voters"]',
    ]).innerHTML = renderResults(Object.values(saved));

    document.querySelector([
      '[data-js="name-results"]',
    ]).innerHTML = renderResults(searchResults);

    
    if (Object.keys(saved).length) {
      const hidden = document.querySelector(".SavedWrapper--hidden")
      if (hidden) hidden.classList.remove("SavedWrapper--hidden");
    } else {
      const savedWrapper = document.querySelector(".SavedWrapper")
      savedWrapper.classList.add("SavedWrapper--hidden"); 
    }
  }

  document
    .querySelector('[data-js="name-results"]')
    .addEventListener("change", onCheck);

  document
    .querySelector('[data-js="saved-voters"]')
    .addEventListener("change", onCheck);

  document
    .querySelector('[data-js="export-button"]')
    .addEventListener("click", (e) => {
      exportResults();
    });
});

function renderResults(results) {
  if (!results.length) return "";

  const fieldsToDisplay = ['Last Name', 'First Name', 'Street Name', 'City', 'Zip']

  return `
    <thead class="Results-header">
        <tr><th class="Results-header_cell"></th>${Object.keys(results[0])
          .filter((value) => value !== "isSelected" && (fieldsToDisplay.indexOf(value) > -1))
          .map((key) => `<th class="Results-header_cell">${key}</th>`)
          .join("")}</tr>
    </thead>
    <tbody>
        ${results
          .map(
            (result) =>
              `<tr class="Results-row"><td class="Results-row_cell"><input type="checkbox" data-id="${
                result[idKey]
              }" ${result.isSelected ? "checked" : ""}></td>${Object.keys(
                result
              )
                .filter((value) => value !== "isSelected" && (fieldsToDisplay.indexOf(value) > -1))
                .map(
                  (key) => `<td class="Results-row_cell">${result[key]}</td>`
                )
                .join("")}</tr>`
          )
          .join("")}
    </tbody>
    `;
}

function queryMatchesVoterField({ normalizedQuery, voter, field }) {
  return normalizeString(voter[field]).indexOf(normalizedQuery) !== -1;
}

function exportResults() {
  const selections = Object.values(saved).map((voter) => {
    delete voter.isSelected;
    return voter;
  });
  exportCSVFile(selections);
}

function convertToCSV(objArray) {
  const array = typeof objArray !== "object" ? JSON.parse(objArray) : objArray;
  let str = "";

  // Add the searcher's email to beginning of each line
  var searcherEmail = document.querySelector('[data-js="input-email"]').value;

  for (let i = 0; i < array.length; i++) {
    let line = searcherEmail;
    for (let index in array[i]) {
      if (line != "") line += ",";
      line += array[i][index];
    }

    str += line + "\r\n";
  }

  return str;
}

function exportCSVFile(items) {
  const jsonObject = JSON.stringify(items);
  const csv = convertToCSV(jsonObject);

  // Create the request to the server to send the CSV
  var formData = new FormData();
  formData.append("file", csv);

  var req = new XMLHttpRequest();
  req.open("POST", `/api/mail`, true);
  req.send(formData);

  req.onload = function () {
    window.location = '/thanks';
  };
}

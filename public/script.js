/**
 * The frontend script that handles querying the database and getting the results.
 */

window.addEventListener("DOMContentLoaded", function () {
  let voters;
  document
    .querySelector(".Wrapper--loading")
    .classList.remove("Wrapper--loading");

  document
    .querySelector('[data-js="input-email"]')
    .addEventListener("keyup", (e) => {
      email = e.target.value;
      if (email.indexOf('@') > -1) {
        document.querySelector(".SearchWrapper--hidden").classList.remove("SearchWrapper--hidden");
      }
    });
  
  document
    .querySelector('[data-js="input-name"]')
    .addEventListener("keyup", (e) => {
      nameQuery = e.target.value;
      var req = new XMLHttpRequest();
      req.open("GET", `/query?name=${encodeURIComponent(nameQuery)}`, true);
      req.send();
      req.onload = function () {
        // console.log(req.response);
        document.querySelector([
          '[data-js="name-results"]',
        ]).innerHTML = renderResults(req.response);
        voters = JSON.parse(req.response);
      };
      //   document.querySelector(
      //     '[data-js="name-results"]'
      //   ).innerHTML = renderResults(searchByName({ query: nameQuery, voters }));
    });
  // document
  //   .querySelector('[data-js="input-address"]')
  //   .addEventListener("keyup", (e) => {
  //     addressQuery = e.target.value;
  //     nameQuery = e.target.value;
  //     var req = new XMLHttpRequest();
  //     req.open("GET", `/query?address=${encodeURIComponent(nameQuery)}`, true);
  //     req.send();
  //     req.onload = function () {
  //       console.log(typeof req.response);
  //       console.log(req.response);
  //     };
  //     req.onreadystatechange = function () {
  //       console.log("ORSTC");
  //       console.log(req.responseText);
  //       if (req.readyState == XMLHttpRequest.DONE) {
  //         // console.log(req.response);
  //         document.querySelector(
  //           '[data-js="address-results"]'
  //         ).innerHTML = renderResults(req.response);
  //         voters = JSON.parse(req.response);
  //       }
  //     };
  //     // document.querySelector(
  //     //   '[data-js="address-results"]'
  //     // ).innerHTML = renderResults(req.response);
  //   });

  document
    .querySelector('[data-js="name-results"]')
    .addEventListener("change", (e) => {
      if (e.target.matches("input")) {
        const id = e.target.dataset.id;
        const voter = voters.find((v) => v["ID Number"] === id);
        if (e.target.checked) {
          voter.isSelected = true;
        } else {
          voter.isSelected = false;
        }

        // document.querySelector(
        //   '[data-js="address-results"]'
        // ).innerHTML = renderResults(
        //   searchByAddress({ query: addressQuery, voters })
        // );
      }
    });
  // document
  //   .querySelector('[data-js="address-results"]')
  //   .addEventListener("change", (e) => {
  //     if (e.target.matches("input")) {
  //       const id = e.target.dataset.id;
  //       const voter = voters.find((v) => v["ID Number"] === id);
  //       if (e.target.checked) {
  //         voter.isSelected = true;
  //       } else {
  //         voter.isSelected = false;
  //       }

  //       document.querySelector(
  //         '[data-js="name-results"]'
  //       ).innerHTML = renderResults(searchByName({ query: nameQuery, voters }));
  //     }
  //   });
  document
    .querySelector('[data-js="export-button"]')
    .addEventListener("click", (e) => {
      exportResults(voters);
    });
});

function renderResults(results) {
  results = JSON.parse(results);
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
                result["ID Number"]
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

function searchByName({ query, voters }) {
  if (query.length < 3) return [];

  const fields = Object.keys(voters[0]);
  const numVoters = voters.length;
  const matches = [];

  const normalizedQuery = normalizeString(query);

  for (let i = 0; i < numVoters; i++) {
    const voter = voters[i];

    if (
      queryMatchesVoterField({ normalizedQuery, voter, field: "First Name" }) ||
      queryMatchesVoterField({ normalizedQuery, voter, field: "Last Name" })
    ) {
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

    if (
      (queryMatchesVoterField({
        normalizedQuery,
        voter,
        field: "House Number",
      }),
      queryMatchesVoterField({
        normalizedQuery,
        voter,
        field: "Street Name",
      }) ||
        queryMatchesVoterField({ normalizedQuery, voter, field: "City" }) ||
        queryMatchesVoterField({ normalizedQuery, voter, field: "Zip" }))
    ) {
      matches.push(voter);
    }
  }

  return matches;
}

function exportResults(voters) {
  console.log('jenna click')
  const selections = (voters || [])
    .filter((voter) => voter.isSelected)
    .map((voter) => {
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
  // const exportedFilename = "voters.csv";
  // const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  // Create the request to the server to send the CSV
  var formData = new FormData();
  formData.append("file", csv);
  // formData.append("personName", "NAMExxx");

  var req = new XMLHttpRequest();
  console.log('jenna sending request')
  req.open("POST", `/api/mail`, true);
  req.send(formData);

  req.onload = function () {
    window.location = '/thanks';
  };


  // if (navigator.msSaveBlob) {
  //   // IE 10+
  //   navigator.msSaveBlob(blob, exportedFilename);
  // } else {
  //   const link = document.createElement("a");
  //   if (link.download !== undefined) {
  //     // feature detection
  //     // Browsers that support HTML5 download attribute
  //     const url = URL.createObjectURL(blob);
  //     link.setAttribute("href", url);
  //     link.setAttribute("download", exportedFilename);
  //     link.style.visibility = "hidden";
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   }
  // }
}

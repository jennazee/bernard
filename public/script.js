/**
 * The frontend script that handles querying the database and getting the results.
 */

window.addEventListener("DOMContentLoaded", function () {
  document
    .querySelector(".Wrapper--loading")
    .classList.remove("Wrapper--loading");
  document
    .querySelector('[data-js="input-name"]')
    .addEventListener("keyup", (e) => {
      nameQuery = e.target.value;
      var req = new XMLHttpRequest();
      req.open("GET", `/query?name=${encodeURIComponent(nameQuery)}`, true);
      req.send();
      req.onload = function () {
        console.log(req.response);
      };
      //   document.querySelector(
      //     '[data-js="name-results"]'
      //   ).innerHTML = renderResults(searchByName({ query: nameQuery, voters }));
    });
  document
    .querySelector('[data-js="input-address"]')
    .addEventListener("keyup", (e) => {
      addressQuery = e.target.value;
      nameQuery = e.target.value;
      var req = new XMLHttpRequest();
      req.open("GET", `/query?address=${encodeURIComponent(nameQuery)}`, true);
      req.send();
      req.onload = function () {
        console.log(typeof(req.response));
        console.log(req.response);
      };
      req.onreadystatechange = function() {
        console.log("ORSTC");
        console.log(req.responeText);
          if (req.readyState == XMLHttpRequest.DONE) {
              console.log(req.responseText);
          }
      }
      // document.querySelector(
      //   '[data-js="address-results"]'
      // ).innerHTML = renderResults(req.response);
    });
});

function renderResults(results) {
    console.log("RENDERING!");
    console.log(results);
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

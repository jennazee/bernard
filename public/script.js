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
        console.log(req.response);
      };
      document.querySelector(
        '[data-js="address-results"]'
      ).innerHTML = renderResults(
        searchByAddress({ query: addressQuery, voters })
      );
    });
});

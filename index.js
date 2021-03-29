const express = require("express");
const app = express();
const port = process.env.PORT || 8000;

const { Client } = require("pg");

const client = new Client({
  connectionString:
    process.env.DATABASE_URL || "postgres://sean@localhost:5432/bernard-local",
  ssl: { rejectUnauthorized: false },
});

client.connect((err) => {
  if (err) {
    console.error("connection error", err.stack);
  } else {
    console.log("connected");
  }
});

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded());

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// this whole query is immensely vulnerable to SQL injection
// but it's fine
app.get("/query", async (req, res) => {
  let url = req.url;
  let where = "";

  // If the query is a name query, search the first name, last name fields
  if (url.includes("?name")) {
    let param = url.split("=");
    const name = decodeURI(param[1].toUpperCase()).trim();
    let firstName, lastName;
    // if space, split and search first and last name
    if (name.includes(" ")) {
      firstName = name.split(" ")[0];
      lastName = name.split(" ")[1];
    }
    where +=
      ' WHERE "First Name" LIKE ' +
      "'%" +
      (firstName || name) +
      "%'" +
      (firstName ? ' AND "Last Name" LIKE ' : ' OR "Last Name" LIKE ') +
      "'%" +
      (lastName || name) +
      "%' ";
    // console.log(where);
    // If the query is an address query, search by street name
  } else if (url.includes("?address")) {
    let param = url.split("=");
    where +=
      ' WHERE "Street Name" LIKE ' + "'%" + param[1].toUpperCase() + "%' ";
  }

  // Construct the query
  let query =
    'SELECT "Last Name", "First Name", "Gender", "Party Code", "House Number" || "House Number Suffix" AS "House Number", "Street Name", "City", "Zip", "ID Number" FROM ' +
    '"public"."CityOnly"' +
    where +
    "LIMIT 20;";

  const queryres = await client.query(query);

  res.json(queryres.rows);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

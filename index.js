const express = require("express");
const app = express();
const port = process.env.PORT || 80;

const { Client } = require("pg");

const client = new Client({
  connectionString:
    "postgres://nick:admin@localhost:5432/bernard-pgh-local",
});

client.connect();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded());

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/query", (req, res) => {
  let url = req.url;
  let where = '';

  // If the query is a name query, search the first name, last name fields
  if(url.includes("?name")){
  	let param = url.split("=");
  	where += ' WHERE "First Name" LIKE ' + "'%" + param[1].toUpperCase() + "%'" + ' OR "Last Name" LIKE ' + "'%" + param[1].toUpperCase() + "%' ";
  // If the query is an address query, search by street name
  } else if(url.includes("?address")){
  	let param = url.split("=");
  	where += ' WHERE "Street Name" LIKE ' + "'%" + param[1].toUpperCase() + "%' ";
  }

  // Construct the query
  let query = 'SELECT "Last Name", "First Name", "Gender", "Party Code", "Street Name", "City", "Zip", "ID Number" FROM ' + '"public"."CityOnly"' + where + "LIMIT 10;";

  client.query(
  	query,
    (err, res) => {
      for(row in res.rows){
      	console.log(res.rows[row]);
      }
      // client.end();
    }
  );
  res.json(res.rows);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

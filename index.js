const express = require("express");
const app = express();
const port = process.env.PORT || 80;

const { Client } = require("pg");

const client = new Client({
  connectionString:
    process.env.HEROKU_POSTGRESQL_AMBER_URL || "postgresql://bernard-pgh-local",
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
  client.query(
    "SELECT table_schema,table_name FROM information_schema.tables;",
    (err, res) => {
      console.log("yey");
      if (err) throw err;
      console.log(res);
      for (let row of res.rows) {
        console.log(JSON.stringify(row));
      }
      client.end();
    }
  );
  res.send("HELLO");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

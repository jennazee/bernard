const express = require("express");
const formidableMiddleware = require('express-formidable');
const nodemailer = require("nodemailer");
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
app.use(formidableMiddleware());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/voters", (req, res) => {
  res.sendFile(__dirname + "/voters.html");
});

app.get("/thanks", (req, res) => {
  res.sendFile(__dirname + "/thanks.html");
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
    'SELECT "Last Name", "First Name", "Gender", "Party Code", "House Number" || "House Number Suffix" AS "House Number", "Street Name", "City", "Zip", "Home Phone", "ID Number" FROM ' +
    '"public"."ALLEGHENY FVE 20210329"' +
    where +
    'ORDER BY "Last Name", "First Name" LIMIT 20;';

  const queryres = await client.query(query);

  res.json(queryres.rows);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

app.post('/api/mail', (req, res) => {
  // Create a transporter to send the mail
  let transporter = nodemailer.createTransport({
      pool: true,
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // use TLS
      auth: {
        user: "field@uniteforpa.com",
        pass: "iymesczsuixgltnk"
      }
  });

  const file = req.fields.file;

  res.redirect(301, "/thanks");

  // Create mail options
  let mailOptions = {
      from: 'Searchy',
      to: "field@uniteforpa.com",
      subject: "Voterfile",
      text: "Voter file",
      attachments: [
        {
          filename: "voters.csv",
          content: file,
        }
      ]
  }

  // Send the message
  transporter.sendMail(mailOptions, function (err, res) {
      if(err){
          console.log('Error');
      } else {
          console.log('Email Sent');
      }
  })
});

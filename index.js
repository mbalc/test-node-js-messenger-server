const serverPort = 8080;

const express = require('express');
const bodyParser = require('body-parser');
const pg = require('pg');

const app = express();
const client = new pg.Client();

app.use(bodyParser.text());

client.query('CREATE LOCAL TEMP TABLE userBase (id int)');

function AddUser(pay, res) {
  console.log('adding a user...');
  let reqBodyObj = {};
  try {
    reqBodyObj = JSON.parse(pay.body);
  } catch (e) {
    return res
      .status(400)
      .send('Request body not a valid JSON object / parseable string!');
  }

  if ('id' in reqBodyObj) {
    const userID = reqBodyObj.id;

    // todo make checking if ID already exists in userBase

    client.query(`INSERT INTO userBase (id) VALUES (${userID})`);
    return res
      .status(200)
      .send(`User of ID=${userID} successfully added to database!`);
  }

  return res
    .status(400)
    .send('Request object doesn\'t contain "id" key!');
}

function ListUsers(pay, res) {
  console.log('listing users...');
  res.send(client.query('SELECT * FROM userBase'));
}

function SendMessage(pay, res) {
  console.log('sending user a message...');
}

app.post('/recipients', AddUser);
app.get('/recipients', ListUsers);
app.post('/send', SendMessage);

app.listen(serverPort, () => {
  console.log(`Messenger server listening on port ${serverPort.toString()}!`);
});

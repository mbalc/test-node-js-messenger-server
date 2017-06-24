const serverPort = 8080;

const express = require('express');
const pg = require('pg');

const app = express();
const client = new pg.Client();

client.query('CREATE LOCAL TEMP TABLE userBase (id int)');

function AddUser(pay, res) {
  res.send(pay.query.id);
  // const user = JSON.parse(pay);
  // console.log(`adding user ${user.id}...`);
  // here we should decompose $pay in some way
  // pg.query('INSERT INTO userBase ');
}

function ListUsers(pay, res) {
  console.log('listing users...');
  res.json(client.query('SELECT * FROM userBase'));
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

const serverPort = 8080;

const express = require('express');
const pg = require('pg');

const app = express();

pg.query('CREATE LOCAL TEMP TABLE userBase (id int)');

function AddUser(pay, res) {
  console.log('adding user...');
  // here we should decompose $pay in some way
  pg.query('INSERT INTO userBase ');
  res.touch();
}

function ListUsers(pay, res) {
  console.log('listing users...');
  res.touch();
}

function SendMessage(pay, res) {
  console.log('sending user a message...');
  res.touch();
}

app.post('/recipients', AddUser);
app.get('/recipients', ListUsers);
app.post('/send', SendMessage);

app.listen(serverPort, () => {
  console.log(`Messenger server listening on port${serverPort.toString()}!`);
});

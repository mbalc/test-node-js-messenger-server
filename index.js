const config = require('./config.json');

const express = require('express');
const bodyParser = require('body-parser');
const pg = require('pg');

const app = express();
const client = new pg.Client(`postgres://${config.pgUsername}:${config.pgPassword}
  @${config.serverHostPath}:${config.pgPort}/${config.pgDatabaseName}`);

app.use(bodyParser.text());

client.connect();
client.query('CREATE TABLE IF NOT EXISTS userBase (id int)');
client.query('TRUNCATE TABLE userBase');

function AddUser(pay, res) {
  console.log('adding a user...');
  let reqBodyObj = {};
  try {
    reqBodyObj = JSON.parse(pay.body);
  } catch (e) {
    console.log('Invalid request body in form of');
    console.log(pay.body);
    return res
      .status(400)
      .send('Request body not a valid JSON object / parseable string!');
  }

  if ('id' in reqBodyObj) {
    const userID = reqBodyObj.id;

    return client.query(`SELECT 1 FROM userBase WHERE id = ${userID}`, (err, out) => {
      console.log(out.rows);
      if (out.rows.size() > 0) { // todo need proper empty array check
        res
          .status(400)
          .send(`User of ID=${userID} has already been added to database, ignoring request...`);
      } else {
        client.query(`INSERT INTO userBase (id) VALUES (${userID})`);
        res
          .status(200)
          .send(`User of ID=${userID} successfully added to database!`);
      }
    });
  }

  return res
    .status(400)
    .send('Request object doesn\'t contain "id" key!');
}

function ListUsers(pay, res) {
  console.log('listing users...');
  client.query('SELECT * FROM userBase', (err, out) => {
    res
      .status(200)
      .send(out.rows);
  });
}

function SendMessage(pay, res) {
  console.log('sending user a message...');
}

app.post('/recipients', AddUser);
app.get('/recipients', ListUsers);
app.post('/send', SendMessage);

app.listen(config.serverPort, () => {
  console.log(`Messenger server listening on port ${config.serverPort.toString()}!`);
});

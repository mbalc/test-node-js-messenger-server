const config = require('./config.json');

const express = require('express');
const bodyParser = require('body-parser');
const pg = require('pg');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;


const app = express();
const pool = new pg.Pool({
  host: config.serverHostPath,
  port: config.pgPort,
  user: config.pgUsername,
  password: config.pgPassword,
  database: config.pgDatabaseName,
});

app.use(bodyParser.text());

pool.connect(() =>
  pool.query('DROP TABLE IF EXISTS userBase', () =>
    pool.query('CREATE TABLE IF NOT EXISTS userBase (id bigint)',
  )));

// finds value assigned to $key in the body of a given payload
// if the key was not found:
//   returns null - if $key was not found
//   sets appropriate status for request response
// else - returns specified value
function PullProp(pay, res, key) {
  let reqBodyObj = {};
  try {
    reqBodyObj = JSON.parse(pay.body);
  } catch (e) {
    console.log('Invalid request body in form of');
    console.log(pay.body);
    res
      .status(400)
      .send('Request body not a valid JSON object / parseable string!');
    return null;
  }

  if (key in reqBodyObj) {
    return reqBodyObj[key];
  }

  res
    .status(400)
    .send(`Request object doesn't contain ${key} key!`);
  return null;
}

function AddUser(pay, res) {
  console.log('adding a user...');
  const userID = PullProp(pay, res, 'id');
  console.log(`ID = ${userID}`);
  if (userID != null) {
    pool.query(`SELECT 1 FROM userBase WHERE id = ${userID}`, (err, out) => {
      if (err) console.log(err);
      else if (out.rows.length > 0) {
        res
          .status(400)
          .send(`User of ID=${userID} has already been added to database, ignoring request...`);
      } else {
        pool.query(`INSERT INTO userBase (id) VALUES (${userID})`);
        res
          .status(200)
          .send(`User of ID=${userID} successfully added to database!`);
      }
    });
  }
}

function ListUsers(pay, res) {
  console.log('listing users...');
  pool.query('SELECT * FROM userBase', (err, out) => {
    res
      .status(200)
      .send(out.rows);
  });
}

function SendMessage(pay, res) {
  console.log('sending users a message...');
  const message = PullProp(pay, res, 'message');
  console.log(message);

  pool.query('SELECT * FROM userBase', (err, out) => {
    out.rows.forEach((obj) => {
      const data = {
        recipient: {
          id: `${obj.id}`,
        },
        message: {
          text: message,
        },
      };

      const xmlreq = new XMLHttpRequest();
      xmlreq.open('POST', `https://graph.facebook.com/v2.6/me/messages?access_token=${config.pageAccessToken}`, true);
      xmlreq.setRequestHeader('Content-Type', 'application/json');
      xmlreq.onreadystatechange = () => {
        if (xmlreq.readyState === 4) {
          console.log(`messaging user ${obj.id}: ${xmlreq.responseText}`);
        }
      };
      xmlreq.send(JSON.stringify(data));
    });
  });

  res.status(200).send('Sending the message to all recipients...');
}

app.post('/recipients', AddUser);
app.get('/recipients', ListUsers);
app.post('/send', SendMessage);

app.listen(config.serverPort, () => {
  console.log(`Messenger server listening on port ${config.serverPort.toString()}!`);
});

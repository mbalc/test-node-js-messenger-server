const config = require('./config.json');

const express = require('express');
const bodyParser = require('body-parser');
const pg = require('pg');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;


const app = express();
const client = new pg.Client(`postgres://${config.pgUsername}:${config.pgPassword}
  @${config.serverHostPath}:${config.pgPort}/${config.pgDatabaseName}`);

app.use(bodyParser.text());

client.connect();
client.query('DROP TABLE IF EXISTS userBase');
client.query('CREATE TABLE IF NOT EXISTS userBase (id bigint)');

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
  if (userID != null) {
    client.query(`SELECT 1 FROM userBase WHERE id = ${userID}`, (err, out) => {
      console.log(out.rows);
      if (out.rows.length > 0) {
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
  console.log('sending users a message...');
  const message = PullProp(pay, res, 'message');
  client.query('SELECT * FROM userBase', (err, out) => {
    out.rows.forEach((obj) => {
      const data = {
        recipient: {
          id: `${obj.id}`,
        },
        message: {
          text: message,
        },
      };
      console.log(data);
      const request = new XMLHttpRequest();
      request.open('POST', `https://graph.facebook.com/v2.6/me/messages?access_token=${config.pageAccessToken}`, true);
      request.setRequestHeader('Content-Type', 'application/json');
      // subscribe to this event before you send your request.
      request.onreadystatechange = function () {
        if (request.readyState == 4) {
   // alert the user that a response now exists in the responseTest property.
          console.log(request.responseText);
   // And to view in firebug
          console.log('xhr', request);
        }
      };
      request.send(JSON.stringify(data));
    });
  });
}

app.post('/recipients', AddUser);
app.get('/recipients', ListUsers);
app.post('/send', SendMessage);

app.listen(config.serverPort, () => {
  console.log(`Messenger server listening on port ${config.serverPort.toString()}!`);
});

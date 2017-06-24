const express = require('express');
const http = require('http');
const pg = require('pg');


const app = express();
const userBase = pg.create();

app.post('/recipients', (req, res) => {
})

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Hello Http');
});
server.listen(8080);

var http = require('http');
const url = require('url');

console.log("beacon started!");

let messages = []

http.createServer(function (req, res) {
  const queryObject = url.parse(req.url,true).query;
  messages.push(queryObject);

  console.log('beacon got: ' + JSON.stringify(queryObject))
  
  res.setHeader("Content-Type", "application/json");
  res.write(JSON.stringify(messages));
  
  res.end();
}).listen(80);
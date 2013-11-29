
/**
 * Module dependencies.
 */

var express = require('express');
var path = require('path');
var http = require('http');
var app = module.exports = express();
var port = process.env.PORT || 3000;
var server = http.createServer(app);

// all environments
app.use(express.errorHandler());

/**
 * Mount
 */

app.use('/build', require('./../'));
app.use('/build', express.static(path.join(__dirname, 'build')));

server.listen(port, function() {
  console.log('listening on port %s', port);
});


/**
 * Module dependencies.
 */

var koa = require('koa');
var app = module.exports = koa();
var path = require('path');
var http = require('http');
var port = process.env.PORT || 3000;
var serve = require('koa-static');
var middleware = require('./../').middleware;

/**
 * Mount
 */

app.use(middleware({dev: true, bundled: true}));
app.use(serve(__dirname + '/build'));
app.use(function *(){
  this.body = '<!DOCTYPE html><link rel="stylesheet" href="/home/build.css"><script src="/home/build.js"></script>' + 
              '<script>require("home");</script>';
});

app.listen(port);
console.log('listening on port %s', port);


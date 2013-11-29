# mnml-build

This is a personal component build, that generates bundled js / css files. 

It supports `.jade` for template and CSS is pre-processed by `.styl` on top of `rework-vars`, `rework-math`.

### Usage

```javascript
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

app.use('/build', require('mnml-build'));
app.use('/build', express.static(path.join(__dirname, 'build'))); // Place static server after build

server.listen(port, function() {
  console.log('listening on port %s', port);
});
```

### Run example

```
$ cd example
$ node server.js
$ open http://localhost:3000/build/home/build.js
```

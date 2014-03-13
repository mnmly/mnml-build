/**
 * Module dependencies
 */
var fs = require('fs');
var path = require('path');
var mkdir = require('mkdirp');
var flatten = require('component-flatten');
var resolve = require('component-resolver');
var Builder = require('component-builder2');
var myth = require('builder-myth');
var debug = require('debug')('mnml-build:builder');

/**
 * Retuns Generator Function that handles building component
 *
 * `params` can accept following options
 *
 * - `out`: output directory
 * - `bundled`: if you want to build bundled component
 * - `copy`: Copy files or symlink?
 * - `replace`: If you need to replace some content forcefully
 * - `dev`: Dev or not
 */

exports = module.exports = function(params){

  params = params || {};
  params.out = params.out || 'build';

  var dev = params.dev || false;
  var copy = params.copy;

  return function*(){
    
    var tree = yield* resolve(process.cwd(), { install: true });
    var out = params.out;

    if(!params.bundled){
      debug('Building component to %s', out);
      yield buildBundle(tree, out);
    } else {
      for(var bundle in tree.locals){
        debug('Building a bundle: %s', bundle);
        out = path.resolve(params.out, bundle);
        yield buildBundle(tree.locals[bundle], out);
      }
    }
  };

  function* buildBundle(tree, out){

    // mkdir -p
    mkdir.sync(out);

    var nodes = flatten(tree); 

    /**
     * Builders
     */
    var script = new Builder.scripts(nodes, {dev: dev});
    var style = new Builder.styles(nodes, {dev: dev});
    var file = new Builder.files(nodes, {dest: out, dev: dev});

    /**
     * Script Plugin(s)
     */

    script.use('scripts', Builder.plugins.js());
    script.use('templates', Builder.plugins.string());

    if(params.replace){
      script.use('scripts', function(file, next){
        var js = fs.readFileSync(file.filename, 'utf8');
        file.string = params.replace(js);
        next();
      });
    }

    /**
     * Style Plugins
     *
     * - `myth`: Enables `myth`
     * - `urlRewriter`: Rewrite `url()` rules in css
     */

    style.use('styles', Builder.plugins.css());
    style.use('styles', myth({whitespace: false}));
    style.use('styles', Builder.plugins.urlRewriter());
    
    /**
     * File Plugins
     */
    var filePlugin = Builder.plugins[copy ? 'copy' : 'symlink'];
    file.use('images', filePlugin());
    file.use('fonts', filePlugin());

    /**
     * Yield all :)
     */

    yield [
      script.toFile(path.resolve(out, 'build.js')),
      style.toFile(path.resolve(out, 'build.css')),
      file.end()
    ];
  }
};


exports.middleware = require('./middleware');


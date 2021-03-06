
/**
 * Module dependencies.
 */

var Builder = require('component-builder');
var styl = require('component-styl');
var jade = require('component-jade');

var reworkVars = require('rework-vars');
var reworkMath = require('rework-math');
var reworkClearfix = require('rework-clearfix');
var mkdir = require('mkdirp');

var fs = require('fs');
var read = fs.readFileSync;
var write = fs.writeFileSync;
var path = require('path');
var meta = JSON.parse(read(process.cwd() + '/component.json'));
var bundles = meta.local;
var Batch = require('batch');
var out = 'build';

/**
 * Component builder middleware.
 */

exports = module.exports = function(req, res, next){
  if (/build/.test(req.url)) {
    return build(next, true);
  } else {
    next();
  }
};

/**
 * Build with bundle
 */

var build = exports.build = function(fn, dev) {

  var batch = new Batch();

  bundles.forEach(function(bundle){
    batch.push(function(done){

      var dir = out + '/' + bundle;
      var builder = new Builder('.');
      mkdir.sync(dir);

      builder.config.local = [bundle];

      builder.addLookup('lib'); // TODO: shouldn't be necessary

      if (dev) {
        builder.development();
        builder.addSourceURLs();
      } else {
        builder.copyFiles();
      }

      builder.copyAssetsTo(dir);
      
      /*
       * Plugins
       */

      styl.plugins = [reworkMath(), reworkVars(), reworkClearfix];
      builder.use(styl);
      builder.use(jade);
      
      /**
       * Build!
       */
      
      builder.build(function(err, res){
        if (err) return done(err);
        var js = dir + '/build.js'; 
        var css =dir + '/build.css'; 
        write(js, res.require + res.js);
        write(css, res.css);
        done(null, {js: js, css: css});
      });
    });
  });

  batch.end(function(errs, results){
    if (errs) {
      console.log(errs);
      return fn && fn(errs);
    }
    fn && fn(null, results);
  });

};

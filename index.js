
/**
 * Module dependencies.
 */

var Builder = require('component-builder');
var styl = require('component-styl');
var jade = require('component-jade');

var reworkVars = require('rework-vars');
var reworkMath = require('rework-math');
var mkdir = require('mkdirp');

var fs = require('fs');
var read = fs.readFileSync;
var write = fs.writeFileSync;
var path = require('path');
var meta = JSON.parse(read(process.cwd() + '/component.json'));
var bundles = meta.local;
var Batch = require('batch');
var out = 'build';
var dev = true;

/**
 * Component builder middleware.
 */

exports = module.exports = function(req, res, next){
  if (/build/.test(req.url)) {
    return build(next);
  } else {
    next();
  }
};

/**
 * Build with bundle
 */

var build = exports.build = function(fn) {

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
      }

      builder.copyAssetsTo(dir);
      
      /*
       * Plugins
       */

      styl.plugins = [reworkMath(), reworkVars()];
      builder.use(styl);
      builder.use(jade);
      
      /**
       * Build!
       */
      
      builder.build(function(err, res){
        if (err) return done(err);
        write(dir + '/build.js', res.require + res.js);
        write(dir + '/build.css', res.css);
        done();
      });
    });
  });

  batch.end(function(errs){
    if (errs) { return console.log(errs); }
    fn && fn();
  });

};

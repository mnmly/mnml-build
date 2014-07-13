module.exports = function (options) {

  options = options || {};

  return function(file, done) {

    if (file.filename === options.filename) {
      var string = options.content;
      if(file.define) string = JSON.stringify(string);
      file.string = string;
      file.read = function(next) { return next(null, string); };
    }

    done();
  };
};

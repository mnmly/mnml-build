module.exports = function (options) {

  options = options || {};

  return function(file, done) {

    if (file.filename === options.filename) {
      var string = options.content;
      file.string = string;
      file.read = function(next) { return next(null, string); };
    }

    done();
  };
};

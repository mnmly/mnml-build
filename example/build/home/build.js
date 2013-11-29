
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("home/index.js", Function("exports, require, module",
"module.exports = Home;\n\
\n\
function Home(){\n\
  console.log('Home');\n\
}\n\
\n\
//@ sourceURL=home/index.js"
));
require.register("dummy/jade-runtime.js", Function("exports, require, module",
"\n\
jade = (function(exports){\n\
/*!\n\
 * Jade - runtime\n\
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * Lame Array.isArray() polyfill for now.\n\
 */\n\
\n\
if (!Array.isArray) {\n\
  Array.isArray = function(arr){\n\
    return '[object Array]' == Object.prototype.toString.call(arr);\n\
  };\n\
}\n\
\n\
/**\n\
 * Lame Object.keys() polyfill for now.\n\
 */\n\
\n\
if (!Object.keys) {\n\
  Object.keys = function(obj){\n\
    var arr = [];\n\
    for (var key in obj) {\n\
      if (obj.hasOwnProperty(key)) {\n\
        arr.push(key);\n\
      }\n\
    }\n\
    return arr;\n\
  }\n\
}\n\
\n\
/**\n\
 * Merge two attribute objects giving precedence\n\
 * to values in object `b`. Classes are special-cased\n\
 * allowing for arrays and merging/joining appropriately\n\
 * resulting in a string.\n\
 *\n\
 * @param {Object} a\n\
 * @param {Object} b\n\
 * @return {Object} a\n\
 * @api private\n\
 */\n\
\n\
exports.merge = function merge(a, b) {\n\
  var ac = a['class'];\n\
  var bc = b['class'];\n\
\n\
  if (ac || bc) {\n\
    ac = ac || [];\n\
    bc = bc || [];\n\
    if (!Array.isArray(ac)) ac = [ac];\n\
    if (!Array.isArray(bc)) bc = [bc];\n\
    ac = ac.filter(nulls);\n\
    bc = bc.filter(nulls);\n\
    a['class'] = ac.concat(bc).join(' ');\n\
  }\n\
\n\
  for (var key in b) {\n\
    if (key != 'class') {\n\
      a[key] = b[key];\n\
    }\n\
  }\n\
\n\
  return a;\n\
};\n\
\n\
/**\n\
 * Filter null `val`s.\n\
 *\n\
 * @param {Mixed} val\n\
 * @return {Mixed}\n\
 * @api private\n\
 */\n\
\n\
function nulls(val) {\n\
  return val != null;\n\
}\n\
\n\
/**\n\
 * Render the given attributes object.\n\
 *\n\
 * @param {Object} obj\n\
 * @param {Object} escaped\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
exports.attrs = function attrs(obj, escaped){\n\
  var buf = []\n\
    , terse = obj.terse;\n\
\n\
  delete obj.terse;\n\
  var keys = Object.keys(obj)\n\
    , len = keys.length;\n\
\n\
  if (len) {\n\
    buf.push('');\n\
    for (var i = 0; i < len; ++i) {\n\
      var key = keys[i]\n\
        , val = obj[key];\n\
\n\
      if ('boolean' == typeof val || null == val) {\n\
        if (val) {\n\
          terse\n\
            ? buf.push(key)\n\
            : buf.push(key + '=\"' + key + '\"');\n\
        }\n\
      } else if (0 == key.indexOf('data') && 'string' != typeof val) {\n\
        buf.push(key + \"='\" + JSON.stringify(val) + \"'\");\n\
      } else if ('class' == key && Array.isArray(val)) {\n\
        buf.push(key + '=\"' + exports.escape(val.join(' ')) + '\"');\n\
      } else if (escaped && escaped[key]) {\n\
        buf.push(key + '=\"' + exports.escape(val) + '\"');\n\
      } else {\n\
        buf.push(key + '=\"' + val + '\"');\n\
      }\n\
    }\n\
  }\n\
\n\
  return buf.join(' ');\n\
};\n\
\n\
/**\n\
 * Escape the given string of `html`.\n\
 *\n\
 * @param {String} html\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
exports.escape = function escape(html){\n\
  return String(html)\n\
    .replace(/&(?!(\\w+|\\#\\d+);)/g, '&amp;')\n\
    .replace(/</g, '&lt;')\n\
    .replace(/>/g, '&gt;')\n\
    .replace(/\"/g, '&quot;');\n\
};\n\
\n\
/**\n\
 * Re-throw the given `err` in context to the\n\
 * the jade in `filename` at the given `lineno`.\n\
 *\n\
 * @param {Error} err\n\
 * @param {String} filename\n\
 * @param {String} lineno\n\
 * @api private\n\
 */\n\
\n\
exports.rethrow = function rethrow(err, filename, lineno){\n\
  if (!filename) throw err;\n\
\n\
  var context = 3\n\
    , str = require('fs').readFileSync(filename, 'utf8')\n\
    , lines = str.split('\\n\
')\n\
    , start = Math.max(lineno - context, 0)\n\
    , end = Math.min(lines.length, lineno + context);\n\
\n\
  // Error context\n\
  var context = lines.slice(start, end).map(function(line, i){\n\
    var curr = i + start + 1;\n\
    return (curr == lineno ? '  > ' : '    ')\n\
      + curr\n\
      + '| '\n\
      + line;\n\
  }).join('\\n\
');\n\
\n\
  // Alter exception message\n\
  err.path = filename;\n\
  err.message = (filename || 'Jade') + ':' + lineno\n\
    + '\\n\
' + context + '\\n\
\\n\
' + err.message;\n\
  throw err;\n\
};\n\
\n\
  return exports;\n\
\n\
})({});//@ sourceURL=dummy/jade-runtime.js"
));
require.alias("home/index.js", "dummy/deps/home/index.js");
require.alias("home/index.js", "home/index.js");

require("dummy/jade-runtime");

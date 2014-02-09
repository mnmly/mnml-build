/**
 * Module dependencies
 */

var koa = require('koa');
var debug = require('debug')('koa-builder:index');
var builder = require('./');
var assetRegExp = /build\.(js|css)/;

module.exports = function(params){
  
  /**
   * Building component per requests
   */

  var build = builder(params);

  return function*(next){
    yield next;
    if(assetRegExp.test(this.url)) yield build;
  };

};


/*!
 * micromatch <https://github.com/jonschlinkert/micromatch>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var unixify = require('unixify');
var union = require('arr-union');
var diff = require('arr-diff');
var braces = require('braces');

/**
 * Special patterns
 */

var matchBase = '[\\s\\S]+';
var dotfile = '[^\\/]*?';

/**
 * Glob tokens to match and replace with
 * regular expressions
 */

var tokens = [
  ['\\\\', {re: /\\{2}/g, to: '\\/'}],
  ['/',    {re: /\//g, to: '\\/'}],
  ['.',    {re: /[.]/g,  to: '\\.'}],
  ['?',    {re: /\?/g, to: '.'}],
  ['**',   {re: /[*]{2}/g,  to: '[\\s\\S]+'}],
  ['*',    {re: /[*]/g,  to: '[^\\/]*?', matchBase: matchBase, dot: dotfile}],
];

var len = tokens.length;

function makeRe(glob, options) {
  glob = unixify(glob);
  var opts = options || {};
  var flags = '';
  var i = 0;

  optsCache = optsCache || opts;
  if (!equal(optsCache, opts)) {
    regex = null;
    cache = glob;
  }

  cache = cache || glob;
  if (cache !== glob) {
    regex = null;
    cache = glob;
  }

  if (regex instanceof RegExp) {
    return regex;
  }

  if (/\{/.test(glob)) {
    if (!/\{.*\{/.test(glob)) {
      glob = glob.replace(/\{/g, '(');
      glob = glob.replace(/,/g, '|');
      glob = glob.replace(/\}/g, ')');
    } else {
      glob = braces(glob).join('|');
    }
  }

  while (i < len) {
    var group = tokens[i++];
    var re = group[1].re;
    var to = group[1].to;

    for (var key in opts) {
      if (group[1].hasOwnProperty(key)) {
        to += group[1][key];
      }
    }
    glob = glob.replace(re, to);
  }

  if (opts.nocase) flags += 'i';

  var res = /^!/.test(glob)
    ? '^(?!((?!\\.)' + glob.slice(1) + ')$)'
    : '^' + glob + '$';

  regex = new RegExp(res, flags);
  return regex;
}

function equal(a, b) {
  if (!b) return a;
  for (var prop in b) {
    if (!a.hasOwnProperty(prop)) {
      return false;
    }
    if (a[prop] !== b[prop]) {
      return false;
    }
  }
  return true;
}

function match(files, pattern, options) {
  if (typeof files !== 'string' && !Array.isArray(files)) {
    throw new Error('micromatch.match() expects a string or array.');
  }

  files = arrayify(files);
  var len = files.length;
  var res = [];
  var i = 0;

  while (i < len) {
    var fp = files[i++];
    if (makeRe(pattern, options).test(fp)) {
      res.push(fp);
    }
  }
  return res;
}

function micromatch(files, patterns, options) {
  options = options || {};

}

function arrayify(val) {
  return !Array.isArray(val)
    ? [val]
    : val;
}

/**
 * Results cache
 */

var regex;
var cache;
var optsCache;

/**
 * Expose `micromatch`
 */

module.exports = micromatch;

/**
 * Expose `micromatch.match`
 */

module.exports.match = match;

/**
 * Expose `micromatch.makeRe`
 */

module.exports.makeRe = makeRe;

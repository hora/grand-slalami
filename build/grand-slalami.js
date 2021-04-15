"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var mlustard = require('mlustard');

var tracery = require('tracery-grammar');

var mods = require('./tracery-mods');

var yaml = require('js-yaml');

var fs = require('fs');

var initGrammar = function initGrammar(seed, gameEvent) {
  if (seed !== undefined) {
    tracery.setRandom(function () {
      return seed;
    });
  }

  var quips = {};

  try {
    quips = yaml.load(fs.readFileSync("".concat(__dirname, "/../lib/quips.yaml"), 'utf-8'));
  } catch (e) {
    console.error(e);
    return;
  }

  var grammar = tracery.createGrammar({}); // populate data from gameEvent

  var _iterator = _createForOfIteratorHelper(quips.data),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _field = _step.value;
      grammar.pushRules(_field, [gameEvent[_field]]);
    } // build grammar

  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  for (var field in quips.grammar) {
    grammar.pushRules(field, quips.grammar[field]);
  } // add mods


  grammar.addModifiers(tracery.baseEngModifiers);
  grammar.addModifiers(mods);
  return grammar;
};

var buildComment = function buildComment(gameEvent, mlustard, grammar) {
  var comment = [];
  debugger; // check for game status

  switch (mlustard.gameStatus) {
    case 'beforeFirstPitch':
      comment = grammar.flatten('#gameStart#');
      break;

    default:
      break;
  }

  return comment;
};
/*
 * @settings is an object with the following props:
 *   - gameEvent: the game event object (from the stream or chronicler)
 *   - mlustard (optional): mlustard data for the gameEvent
 *   - seed (optional): a seed, for deterministic comment generation
 */


var getComment = function getComment(settings) {
  if (!settings.gameEvent) {
    return [];
  } //console.log('\n\n\n')
  //console.log(settings)
  //console.log('\n\n\n')


  settings.mlustard = settings.mlustard || mlustard.analyzeGameEvent(settings.gameEvent);
  var grammar = initGrammar(settings.seed, settings.gameEvent);
  return buildComment(settings.gameEvent, settings.mlustard, grammar);
};

module.exports = {
  getComment: getComment
};
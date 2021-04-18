"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var mlustard = require('mlustard');

var tracery = require('tracery-grammar');

var mods = require('./tracery-mods');

var yaml = require('js-yaml');

var fs = require('fs');

var initGrammar = function initGrammar(seed, gameEvent, mlustard) {
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
      var data = gameEvent[_field];

      if (data !== undefined) {
        // some data needs massaging
        switch (_field) {
          case 'inning':
            data++;
            data = data.toString();
            break;

          case 'topOfInning':
            data = data ? 'top' : 'bottom';
            break;

          case 'halfInningOuts':
          case 'homeScore':
          case 'awayScore':
            data = data.toString();
            break;

          default:
            break;
        }

        grammar.pushRules(_field, data);
      }
    } // current pitcher

  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  var cPitcher = gameEvent.topOfInning ? gameEvent.homePitcherName : gameEvent.awayPitcherName;
  grammar.pushRules('cPitcher', cPitcher); // current batter (can be an empty string if nobody batting)

  var cBatter = gameEvent.homeBatterName || gameEvent.awayBatterName;
  grammar.pushRules('cBatter', cBatter); // pitching team nickname

  var pNick = gameEvent.topOfInning ? '#hNick#' : '#aNick#';
  grammar.pushRules('pNick', pNick); // batting team nickname

  var bNick = gameEvent.topOfInning ? '#aNick#' : '#hNick#';
  grammar.pushRules('bNick', bNick); // leading & trailing team nicknames and scores

  var lTeam;
  var tTeam;
  var lScore;
  var tScore;

  if (gameEvent.awayScore > gameEvent.homeScore) {
    lTeam = '#aNick#';
    tTeam = '#hNick#';
    lScore = '#aScore#';
    tScore = '#hScore#';
  } else {
    lTeam = '#hNick#';
    tTeam = '#aNick#';
    lScore = '#hScore#';
    tScore = '#aScore#';
  }

  grammar.pushRules('lTeam', lTeam);
  grammar.pushRules('tTeam', tTeam);
  grammar.pushRules('lScore', lScore);
  grammar.pushRules('tScore', tScore); // set base runners

  if (gameEvent.baserunnerCount >= 3) {
    grammar.pushRules('runners', '#basesLoaded#');
  } else if (gameEvent.baserunnerCount > 0) {
    grammar.pushRules('runners', '#runnersOnBase#');
  }

  var bases = '';

  for (var _i = 0, _Object$keys = Object.keys(mlustard.baseRunners); _i < _Object$keys.length; _i++) {
    var base = _Object$keys[_i];

    if (mlustard.baseRunners[base].playerId) {
      bases += "".concat(base, " ");
    }
  }

  grammar.pushRules('basesOcc', bases.trim()); // build grammar

  for (var field in quips.grammar) {
    grammar.pushRules(field, quips.grammar[field]);
  } // add mods


  grammar.addModifiers(tracery.baseEngModifiers);
  grammar.addModifiers(mods);
  return grammar;
};

var buildComment = function buildComment(gameEvent, mlustard, grammar) {
  var comment = ''; // check for game status

  switch (mlustard.gameStatus) {
    case 'beforeFirstPitch':
      comment = grammar.flatten('#gameStart#');
      break;

    case 'firstHalfInningStart':
      // don't modify if it's the top of 1 since pitching info
      // has already been introduced at the start of the game
      if (gameEvent.inning !== 0) {
        comment = grammar.flatten('#inningStart#');
      }

      break;

    case 'secondHalfInningStart':
      comment = grammar.flatten('#inningStart#');
      break;

    default:
      break;
  } // check for outs


  if (mlustard.out) {
    if (mlustard.gameStatus === 'halfInningEnd') {
      comment = grammar.flatten('#lastOutOfInning#');
    } else {
      comment = grammar.flatten('#out#');
    }
  } // check for score


  if (mlustard.runsScored !== 0) {
    comment = grammar.flatten('#score#');
  } // check if a batter just showed up at the plate


  if (mlustard.batterUp && gameEvent.baserunnerCount) {
    comment = grammar.flatten('#batterUpRunners#');
  } // return a comment if one was created, OR
  // the original text if it exists, OTHERWISE
  // an empty string


  comment = comment || gameEvent.lastUpdate || '';
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
    return '';
  }

  settings.mlustard = settings.mlustard || mlustard.analyzeGameEvent(settings.gameEvent);
  var grammar = initGrammar(settings.seed, settings.gameEvent, settings.mlustard);
  return buildComment(settings.gameEvent, settings.mlustard, grammar);
};

module.exports = {
  getComment: getComment
};
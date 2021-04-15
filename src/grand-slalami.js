const mlustard = require('mlustard');
const tracery = require('tracery-grammar');
const mods = require('./tracery-mods');
const yaml = require('js-yaml');
const fs = require('fs');

const initGrammar = (seed, gameEvent) => {
  if (seed !== undefined) {
    tracery.setRandom(() => seed);
  }

  let quips = {};

  try {
    quips = yaml.load(fs.readFileSync(`${__dirname}/../lib/quips.yaml`, 'utf-8'));
  } catch (e) {
    console.error(e);
    return;
  }

  let grammar = tracery.createGrammar({});

  // populate data from gameEvent
  for (const field of quips.data) {
    let data = gameEvent[field];

    if (data !== undefined) {

      // some data needs massaging
      switch (field) {

        case 'inning':
          data++;
          data = data.toString();
          break;

        case 'topOfInning':
          data = data ? 'top' : 'bottom';
          break;

        case 'halfInningOuts':
          data = data.toString();
          break;

        default:
          break;
      }

      grammar.pushRules(field, data);
    }
  }

  // build grammar
  for (const field in quips.grammar) {
    grammar.pushRules(field, quips.grammar[field]);
  }

  // add mods
  grammar.addModifiers(tracery.baseEngModifiers);
  grammar.addModifiers(mods);

  return grammar;
};

const buildComment = (gameEvent, mlustard, grammar) => {
  let comment = '';

  // check for game status
  switch (mlustard.gameStatus) {

    case 'beforeFirstPitch':
      comment = grammar.flatten('#gameStart#');
      break;

    default:
      break;
  }

  // check for outs
  if (mlustard.out) {
    //debugger
    comment = grammar.flatten('#out#');
  }

  return comment;
};

/*
 * @settings is an object with the following props:
 *   - gameEvent: the game event object (from the stream or chronicler)
 *   - mlustard (optional): mlustard data for the gameEvent
 *   - seed (optional): a seed, for deterministic comment generation
 */
const getComment = (settings) => {
  if (!settings.gameEvent) {
    return '';
  }

  settings.mlustard = settings.mlustard || mlustard.analyzeGameEvent(settings.gameEvent);

  let grammar = initGrammar(settings.seed, settings.gameEvent);

  return buildComment(settings.gameEvent, settings.mlustard, grammar);
};

module.exports = {
  getComment,
};


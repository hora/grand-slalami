const mlustard = require('mlustard');
const tracery = require('tracery-grammar');
const mods = require('./tracery-mods');
const yaml = require('js-yaml');
const fs = require('fs');

const initGrammar = (seed, gameEvent, mlustard) => {
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
        case 'homeScore':
        case 'awayScore':
          data = data.toString();
          break;

        default:
          break;
      }

      grammar.pushRules(field, data);
    }
  }

  // current pitcher
  const cPitcher = gameEvent.topOfInning ? gameEvent.homePitcherName : gameEvent.awayPitcherName;
  grammar.pushRules('cPitcher', cPitcher);

  // current batter (can be an empty string if nobody batting)
  const cBatter = gameEvent.homeBatterName || gameEvent.awayBatterName;
  grammar.pushRules('cBatter', cBatter);

  // pitching team nickname
  const pNick = gameEvent.topOfInning ? '#hNick#' : '#aNick#';
  grammar.pushRules('pNick', pNick);

  // batting team nickname
  const bNick = gameEvent.topOfInning ? '#aNick#' : '#hNick#';
  grammar.pushRules('bNick', bNick);

  // leading & trailing team nicknames and scores
  let lTeam;
  let tTeam;
  let lScore;
  let tScore;

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
  grammar.pushRules('tScore', tScore);

  // set base runners
  if (gameEvent.baserunnerCount >= 3) {
    grammar.pushRules('runners', '#basesLoaded#');
  } else if (gameEvent.baserunnerCount > 0) {
    grammar.pushRules('runners', '#runnersOnBase#');
  }

  let bases = '';
  for (let base of Object.keys(mlustard.baseRunners)) {
    if (mlustard.baseRunners[base].playerId) {
      bases += `${base} `;
    }
  }
  grammar.pushRules('basesOcc', bases.trim());

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
  }

  // check for outs
  if (mlustard.out) {
    if (mlustard.gameStatus === 'halfInningEnd') {
      comment = grammar.flatten('#lastOutOfInning#');
    } else {
      comment = grammar.flatten('#out#');
    }
  }

  // check for score
  if (mlustard.runsScored !== 0) {
    comment = grammar.flatten('#score#');
  }

  // check if a batter just showed up at the plate
  if (mlustard.batterUp && gameEvent.baserunnerCount) {
    comment = grammar.flatten('#batterUpRunners#');
  }

  // return a comment if one was created, OR
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
const getComment = (settings) => {
  if (!settings.gameEvent) {
    return '';
  }

  settings.mlustard = settings.mlustard || mlustard.analyzeGameEvent(settings.gameEvent);

  let grammar = initGrammar(settings.seed, settings.gameEvent, settings.mlustard);

  return buildComment(settings.gameEvent, settings.mlustard, grammar);
};

module.exports = {
  getComment,
};


const yaml = require('js-yaml');
const fs = require('fs');
const tracery = require('tracery-grammar');

const mods = require('./tracery-mods');

const init = (settings) => {
  const seed = settings.seed;
  const gameEvent = settings.gameEvent;
  const mlustard = settings.mlustard;
  const overrides = settings.overrides;

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

  // build quips grammar
  for (const field in quips.grammar) {
    grammar.pushRules(field, quips.grammar[field]);
  }

  // do quip overrides
  for (const field in overrides) {
    grammar.pushRules(field, overrides[field]);
  }

  // add mods
  grammar.addModifiers(tracery.baseEngModifiers);
  grammar.addModifiers(mods);

  return grammar;
};

module.exports = {
  init,
};


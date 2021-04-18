const buildComment = (settings, grammar) => {
  const gameEvent = settings.gameEvent;
  const mlustard = settings.mlustard;

  //let comment = '';

  // check for game status
  switch (mlustard.gameStatus) {

    case 'beforeFirstPitch':
      return grammar.flatten('#gameStart#');
      break;

    case 'firstHalfInningStart':
      if (gameEvent.inning === 0) {
        return grammar.flatten('#inningOneStart#');
      } else {
        return grammar.flatten('#inningStart#');
      }
      break;

    case 'secondHalfInningStart':
      return grammar.flatten('#inningStart#');
      break;

    default:
      break;
  }

  // check for outs
  if (mlustard.out) {
    if (mlustard.gameStatus === 'halfInningEnd') {
      return grammar.flatten('#lastOutOfInning#');
    } else {
      return grammar.flatten('#out#');
    }
  }

  // check for score
  if (mlustard.runsScored !== 0) {
    return grammar.flatten('#score#');
  }

  // check if a batter just showed up at the plate
  if (mlustard.batterUp && gameEvent.baserunnerCount) {
    return grammar.flatten('#batterUpRunners#');
  }

  // if no special comment was returned, return the original update if it
  // exists, otherwise an empty string
  return gameEvent.lastUpdate || '';
};

module.exports = {
  buildComment,
};


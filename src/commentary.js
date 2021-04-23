const buildComment = (settings, grammar) => {
  const gameEvent = settings.gameEvent;
  const mlustard = settings.mlustard;

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

  let comment = '';

  // check for outs
  if (mlustard.out) {
    if (mlustard.gameStatus === 'halfInningEnd') {
      comment += grammar.flatten('#lastOutOfInning#');
    } else {
      comment += grammar.flatten('#out#');
    }
  }

  // check for score
  if (
    mlustard.runsScored !== 0 ||
    mlustard.unrunsScored !== 0 ||

    // score change due to salmon stealing runs
    (mlustard.special &&
    mlustard.specialMeta.kind === 'salmon' &&
    mlustard.specialMeta.details &&
    mlustard.specialMeta.details.runsStolen.length) ||

    // score change from sun 2 smiling
    (mlustard.special &&
    mlustard.specialMeta.kind === 'sun2') ||

    // score change from black hole swallowing
    (mlustard.special &&
    mlustard.specialMeta.kind === 'blackHole')
  ) {
    if (comment) {
      comment += grammar.flatten('#scoreAddon#');
    } else {
      comment += grammar.flatten('#score#');
    }
  }

  // check if a batter just showed up at the plate
  if (mlustard.batterUp && gameEvent.baserunnerCount) {
    comment += grammar.flatten('#batterUpRunners#');
  }

  // return the comment if it was created, otherwise the original update if it
  // exists, otherwise an empty string
  return comment || gameEvent.lastUpdate || '';
};

module.exports = {
  buildComment,
};


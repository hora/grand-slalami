const assert = require('chai').assert;
const grandSlalami = require('../build/grand-slalami');

const gameEvents = require('./data/gameEvents');

describe('grandSlalami', () => {
  describe('getComment()', () => {

    let settings;

    beforeEach(() => {
      settings = {
        seed: 0
      }
    });

    //it('should return an array', () => {
      //for (const gameId in gameEvents) {
        //settings.gameEvent = gameEvents[gameId];
        //assert.isArray(grandSlalami.getComment(settings));
      //}
    //});

    it('should return an empty string if no game event is provided', () => {
      settings.gameEvent = gameEvents.noData;

      const comment = grandSlalami.getComment(settings);

      assert.equal(comment, '');
    });

    it('should intro the matchup before the game begins',() => {
      settings.gameEvent = gameEvents.beforeFirstPitch;

      const comment = grandSlalami.getComment(settings);

      const expected = "Millennials vs Tigers. " +
        "Patty Fox pitching for the Millennials, Yazmin Mason for the Tigers. " +
        "Play ball!";

      assert.equal(comment, expected);
    });

    it('should summarize the status on an out', () => {
      settings.gameEvent = gameEvents.flyout;

      const comment = grandSlalami.getComment(settings);

      const expected = "Fish Summer hit a flyout to Penelope Mathews. " +
        "Top of 1, 1 out.";

      assert.equal(comment, expected);
    });

  });
});

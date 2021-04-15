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

    it('should return an array', () => {
      for (const gameId in gameEvents) {
        settings.gameEvent = gameEvents[gameId];
        assert.isArray(grandSlalami.getComment(settings));
      }
    });

    it('should return an empty array if no game event is provided', () => {
      settings.gameEvent = gameEvents.noData;

      const comment = grandSlalami.getComment(settings);

      assert.deepEqual(comment, []);
    });

    it('should intro the matchup before the game begins',() => {
      settings.gameEvent = gameEvents.beforeFirstPitch;

      const comment = grandSlalami.getComment(settings);

      const expected = "Millennials vs Tigers. " +
        "Patty Fox pitching for the Millennials, Yazmin Mason for the Tigers. " +
        "Play ball!";

      assert.equal(comment, expected);
    });

  });
});

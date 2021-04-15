const assert = require('chai').assert;
const grandSlalami = require('../build/grand-slalami');

const gameEvents = require('./data/gameEvents');

describe('grandSlalami', () => {
  describe('getComment()', () => {

    let settings = {
      seed: 0,
      gameEvent: {},
      mlustard: {},
      ryeBread: {},
    };

    it('should return an array', () => {
      for (const gameId in gameEvents) {
        assert.isArray(grandSlalami.getComment(gameEvents[gameId]));
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

      const expected = [
        "New York Millenials vs. Hades Tigers.",
        "Patty Fox pitching for the Millenials, Yazmin Mason for the Tigers.",
        "Play ball!"
      ];

      assert.deepEqual(comment, expected);
    });

  });
});

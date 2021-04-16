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

    it('should return an empty string if no game event is provided', () => {
      settings.gameEvent = gameEvents.noData;

      const comment = grandSlalami.getComment(settings);

      assert.equal(comment, '');
    });

    it('should return the original lastUpdate if no change is made', () => {
      settings.gameEvent = gameEvents.noChange;
      const comment = grandSlalami.getComment(settings);

      assert.equal(gameEvents.noChange.lastUpdate, comment);
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

    it('should mention the pitcher on half inning start', () => {
      settings.gameEvent = gameEvents.firstHalf;
      const com1 = grandSlalami.getComment(settings);
      const exp1 = "Top of 2, Hades Tigers batting. " +
        "Patty Fox pitching for the Millennials.";

      assert.equal(com1, exp1);

      settings.gameEvent = gameEvents.secondHalf;
      settings.mlustard = undefined;
      const com2 = grandSlalami.getComment(settings);
      const exp2 = "Bottom of 1, New York Millennials batting. " +
        "Yazmin Mason pitching for the Tigers.";

      assert.equal(com2, exp2);
    });

    it('should not mention the pitcher on top of 1', () => {
      settings.gameEvent = gameEvents.topOfOne;
      const com1 = grandSlalami.getComment(settings);
      const exp1 = "Top of 1, LA Unlimited Tacos batting.";

      assert.equal(com1, exp1);
    });

  });
});

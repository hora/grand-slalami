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

    it('should return original comment on last out of inning', () => {
      settings.gameEvent = gameEvents.lastOutInning;
      const comment = grandSlalami.getComment(settings);
      const expected = "Spears Taylor hit a ground out to Thomas Dracaena.";

      assert.equal(comment, expected);
    });

    it('should mention the pitcher on half inning start', () => {
      settings.gameEvent = gameEvents.firstHalf;
      const com1 = grandSlalami.getComment(settings);
      const exp1 = "Top of 2, Hades Tigers batting. " +
        "Patty Fox pitching for the Millennials.";

      assert.equal(com1, exp1);

      // reset settings
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

    it('should update the total score on runs', () => {
      settings.gameEvent = gameEvents.dbl;
      const commentary = grandSlalami.getComment(settings);
      const expected = "Ren Morin hits a Double! 1 scores. " +
        "It's the Tigers 1 and the Millennials 0.";

      assert.equal(commentary, expected);
    });

    it('should update the total score on unruns', () => {
      settings.gameEvent = gameEvents.coffeeUnruns;
      const commentary = grandSlalami.getComment(settings);
      const expected = "Anathema Elemefayo strikes out swinging. " +
        "0.3 Unruns scored! " +
        "Bottom of 1, 1 out. " +
        "" +
        "It's the Breath Mints 1 and the Millennials -0.3.";

      assert.equal(commentary, expected);
    });

    it('should update the total score on black hole swallow', () => {
      settings.gameEvent = gameEvents.blackHoleSwallows;
      const commentary = grandSlalami.getComment(settings);
      const expected = "The Tigers collect 10!\n" +
        "The Black Hole swallows the Runs and a Lift Win. " +
        "It's the Lift 5 and the Tigers 0.";

      assert.equal(commentary, expected);
    });

    it('should update the total score on sun 2 smile', () => {
      settings.gameEvent = gameEvents.sun2smile;
      const commentary = grandSlalami.getComment(settings);
      const expected = "The Georgias collect 10! Sun 2 smiles.\n" +
        "Sun 2 set a Win upon the Georgias. " +
        "It's the Tigers 5 and the Georgias 0.";

      assert.equal(commentary, expected);
    });

    it('should update the total score on salmon run steal', () => {
      settings.gameEvent = gameEvents.salmonSteal;
      const commentary = grandSlalami.getComment(settings);
      const expected = "The Salmon swim upstream!\n" +
        "Inning 5 begins again.\n" +
        "3 of the Flowers's Runs are lost!\n" +
        "2 of the Tigers's Runs are lost!\n" +
        "Paula Turnip is caught in the bind! " +
        "It's the Flowers 4 and the Tigers 1.";

      assert.equal(commentary, expected);
    });

    it('should not mention runners when a batter shows up to the plate if there are none', () => {
      settings.gameEvent = gameEvents.batter;
      const commentary = grandSlalami.getComment(settings);
      const expected = "M---w-ll Mason batting for the Tacos.";

      assert.equal(commentary, expected);
    });

    it('should mention runners when a batter shows up to the plate if there are runners on base', () => {
      settings.gameEvent = gameEvents.batterRunners;
      const commentary = grandSlalami.getComment(settings);
      const expected = "Halexandrey Walton batting for the Tacos. " +
        "Runner on second.";

      assert.equal(commentary, expected);
    });

    it('should mention runners when a batter shows up to the plate if there are multiple runners on base', () => {
      settings.gameEvent = gameEvents.multipleRunners;
      const commentary = grandSlalami.getComment(settings);
      const expected = "M---w-ll Mason batting for the Tacos. " +
        "Runners on first and third.";

      assert.equal(commentary, expected);
    });

    it('should mention bases are loaded when a batter shows up to the plate when the bases are loaded', () => {
      settings.gameEvent = gameEvents.blasesLoaded;
      const commentary = grandSlalami.getComment(settings);
      const expected = "Kurt Crueller batting for the Magic. " +
        "Bases are loaded!";

      assert.equal(commentary, expected);
    });

    it('should override bases loaded comment with blases loaded', () => {
      settings.gameEvent = gameEvents.blasesLoaded;
      settings.overrides = {
        basesLoaded: 'Blases are loaded!'
      };
      const commentary = grandSlalami.getComment(settings);
      const expected = "Kurt Crueller batting for the Magic. " +
        "Blases are loaded!";

      assert.equal(commentary, expected);
    });

  });
});

"use strict";

module.exports = {
  the: function the(s) {
    return "the ".concat(s);
  },
  outs: function outs(s) {
    if (s === '1') {
      return "".concat(s, " out");
    } else {
      return "".concat(s, " outs");
    }
  }
};
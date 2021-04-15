module.exports = {
  the: (s) => {
    return `the ${s}`;
  },

  outs: (s) => {
    if (s === '1') {
      return `${s} out`;
    } else {
      return `${s} outs`;
    }
  },
};


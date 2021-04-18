module.exports = {
  the: (s) => {
    return `the ${s}`;
  },

  // counts the # of outs and pluralizes accordingly
  outs: (s) => {
    if (s === '1') {
      return `${s} out`;
    } else {
      return `${s} outs`;
    }
  },

  // oxford commas
  and: (s) => {
    return s.split(' ').join(', ').replace(/, ([^,]*)$/, ' and $1');
  },

  // for pluralizing runner(s) on first[, second and third]
  runnerPluralize: (s) => {
    if (s.indexOf(',') >= 0 || s.indexOf('and') >= 0) {
      return s.replace('Runner', 'Runners');
    } else {
      return s;
    }
  },
};


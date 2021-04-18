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

  // oxford commas
  and: (s) => {
    return s.split(' ').join(', ').replace(/, ([^,]*)$/, ' and $1');
  },

  // for pluralizing runner(s) on first[, second and third]
  // todo: find a cleaner way of doing this
  pluralize: (s) => {
    if (s.indexOf(',') >= 0 || s.indexOf('and') >= 0) {
      return s.replace('Runner', 'Runners');
    } else {
      return s;
    }
  },
};


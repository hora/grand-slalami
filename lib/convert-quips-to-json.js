const yaml = require('js-yaml');
const fs = require('fs');

const quips = {};

fs.readdirSync(`${__dirname}/quips`).forEach((quipsFile) => {
  if (quipsFile.indexOf('.yaml') >= 1) {
    const field = quipsFile.slice(0, -5);

    quips[field] = yaml.load(fs.readFileSync(`${__dirname}/quips/${quipsFile}`, 'utf-8'));
  }
});

fs.writeFile(`${__dirname}/../build/quips.json`,
  JSON.stringify(quips),
  (err) => {
    if (err) console.error(err);
});

//quips.data = yaml.load(fs.readFileSync(`${__dirname}/quips/data.yaml`, 'utf-8'));
//quips.shortcuts = yaml.load(fs.readFileSync(`${__dirname}/quips/shortcuts.yaml`, 'utf-8'));
//quips.minimal = yaml.load(fs.readFileSync(`${__dirname}/quips/minimal.yaml`, 'utf-8'));



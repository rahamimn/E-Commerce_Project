const Chance = require("chance");

const chance = Chance();

'use strict';

module.exports = {
  generateRandomData
};

function generateRandomData(userContext, events, done) {
  // generate data with Faker:
  const userName = `${chance.name()}${chance.natural()}`;
  userContext.vars.userName = userName;
  return done();
}
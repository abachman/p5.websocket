// https://jestjs.io/docs/en/configuration.html

module.exports = {
  collectCoverage: false,
  coverageDirectory: "coverage",

  // A map from regular expressions to paths to transformers
  transform: {
    "^.+\\.js$": "babel-jest",
  },
};

const errors = {
  www(msg = null) {
    return new Error(msg || "WWWError");
  },
  config(msg = null) {
    return new Error(msg || "ConfigError");
  },
};

module.exports = errors;

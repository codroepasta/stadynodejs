const createError = require("http-errors");
const cors = require("cors");

const config = require("./config");
const w = require("./wrapper");

const corsOptions = {
  origin: (origin, callback) => {
    if (config.nodeEnv.indexOf("development") !== -1)
      return callback(null, false);
    if (!config.cors.enable) return callback(null, false);
    if (config.cors.whiteList.indexOf(origin) === -1)
      return callback(createError(403));
    return callback(null, true);
  },
};

module.exports = () => w(cors(corsOptions));

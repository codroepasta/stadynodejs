const createError = require("http-errors");

const config = require("./config");
const w = require("./wrapper");

const maintenance = () =>
  w((req, res, next) => {
    if (config.maintenance.enable) next(createError(503));
    next();
  });

module.exports = maintenance;

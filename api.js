const express = require("express");

const helmet = require("helmet");
const noCache = require("nocache");
const createError = require("http-errors");
const path = require("path");

const errors = require("./common/errors");
const config = require("./common/config");
const log = require("./common/log")();
const w = require("./common/wrapper");
const response = require("./common/response");
const db = require("./common/db");
const maintenance = require("./common/maintenance");
const cors = require("./common/cors");

const app = express();

try {
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(noCache());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(log.handler());
  // TODO : trim & sanitizing

  // alive check
  app.use("/", require("./routes/index"));

  app.use(maintenance());
  app.use(cors());

  app.use("/auth", require("./routes/auth"));
  app.use("/authority", require("./routes/authority"));
  app.use("/user", require("./routes/user"));
  app.use("/user/authority", require("./routes/userAuthority"));
  app.use("/user/password", require("./routes/userPassword"));

  app.use((req, res, next) => {
    const e = createError(404);
    next(e);
  });
  app.use((e, req, res, next) => {
    log.error(e);
    const payload = response.failure(e);
    res.status(e.status || 500);
    res.json(payload);
  });
} catch (e) {
  log.fatal(e);
}

module.exports = app;

(async () => {
  try {
    await db.sequelize.authenticate();
    app.use(db.handler());
  } catch (e) {
    log.fatal(e);
  }
})();

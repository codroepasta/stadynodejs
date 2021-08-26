const createError = require("http-errors");
const jwt = require("jsonwebtoken");

const config = require("./config");
const w = require("../common/wrapper");
const { model } = require("../common/db");

const { User } = model;

const authenticate = {
  verify: w(async (req, res, next) => {
    const { authorization } = req.headers;
    const { principal } = jwt.verify(authorization, config.jwt.secret);
    const count = await User.count({
      paranoid: true,
      attributes: ["login_id"],
      where: { login_id: principal.login_id, activate: true },
    });
    if (count === 1) return next();
    const e = createError(511);
    next(e);
  }),
  authority:
    (...authorities) =>
    (req, res, next) => {
      const { authorization } = req.headers;
      const { principal } = jwt.verify(authorization, config.jwt.secret);
      const anonymous = authorities.indexOf("ANONYMOUS") !== -1;
      if (anonymous) {
        return next();
      } else {
        const check = authorities.some((authority) =>
          principal.UserAuthorities.some(({ name }) => authority === name)
        );
        if (check) return next();
      }
      const e = createError(403);
      next(e);
    },
};

module.exports = authenticate;

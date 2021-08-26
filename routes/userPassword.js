const express = require("express");
const createError = require("http-errors");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { nanoid } = require("nanoid");

const config = require("../common/config");
const log = require("../common/log")();
const w = require("../common/wrapper");
const response = require("../common/response");
const { sequelize, model } = require("../common/db");
const authenticate = require("../common/authenticate");

const router = express.Router();
const { User } = model;

const record = {
  password: {
    async update(login_id, password, new_password) {
      const check = await User.findOne({
        paranoid: true,
        where: { login_id, password, activate: true },
      });
      if (!check) throw createError(404);
      const transaction = await sequelize.transaction();
      try {
        await User.update(
          { password: new_password },
          { where: { login_id }, transaction }
        );
        await transaction.commit();
      } catch (e) {
        await transaction.rollback();
        throw e;
      }
      const result = { login_id };
      return result;
    },
    reset: {
      async update(login_id) {
        const [offset, length] = [0, 8];
        let tmp = nanoid();
        const count = Math.ceil((length / tmp.length) * 10) / 10;
        for (let i = 1; i < count; i++) {
          tmp += nanoid();
        }
        const new_password = tmp.substr(offset, length);
        const check = await User.findOne({
          paranoid: true,
          where: { login_id, activate: true },
        });
        if (!check) throw createError(404);
        const transaction = await sequelize.transaction();
        try {
          await User.update(
            { password: new_password },
            { where: { login_id }, transaction }
          );
          await transaction.commit();
        } catch (e) {
          await transaction.rollback();
          throw e;
        }
        const result = { login_id, randomPassword };
        return result;
      },
    },
  },
};

router.post(
  "/",
  authenticate.verify,
  authenticate.authority("ANONYMOUS"),
  // TODO: バリデーションチェック
  w((req, res, next) => {
    const { new_password, confirm_password } = req.body;
    if (new_password !== confirm_password) throw createError(400);
    if (false) throw createError(400);
    next();
  }),
  w(async (req, res, next) => {
    const { authorization } = req.headers;
    const { principal } = jwt.verify(authorization, config.jwt.secret);
    const { login_id } = principal;
    const { password, new_password } = Object.assign({}, req.body);
    const result = await record.password.update(
      login_id,
      password,
      new_password
    );
    const payload = response.success(result);
    res.json(payload);
  })
);

router.post(
  "/reset",
  authenticate.verify,
  authenticate.authority("ANONYMOUS"),
  // TODO: バリデーションチェック
  w((req, res, next) => {
    if (false) throw createError(400);
    next();
  }),
  w(async (req, res, next) => {
    const { login_id } = Object.assign({}, req.body);
    const result = await record.password.reset.update(login_id);
    const payload = response.success(result);
    res.json(payload);
  })
);

module.exports = router;

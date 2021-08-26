const express = require("express");
const createError = require("http-errors");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const config = require("../common/config");
const log = require("../common/log")();
const w = require("../common/wrapper");
const response = require("../common/response");
const { sequelize, model } = require("../common/db");

const router = express.Router();
const { User, UserAuthority } = model;

router.post(
  "/token",
  // TODO: バリデーションチェック
  w((req, res, next) => {
    if (false) throw createError(400);
    next();
  }),
  w(async (req, res, next) => {
    const { username, password } = Object.assign({}, req.body);
    const user = await User.findOne({
      paranoid: true,
      attributes: ["login_id", "password", "name"],
      where: {
        login_id: username,
        activate: true,
      },
      include: [
        {
          model: UserAuthority,
          required: false,
          paranoid: true,
          attributes: ["name"],
        },
      ],
    });
    if (!user) throw createError(401);
    if (!bcrypt.compareSync(password, user.password)) throw createError(401);
    let tmp = JSON.parse(JSON.stringify(user));
    delete tmp.password;
    const token = jwt.sign(
      { principal: tmp },
      config.jwt.secret,
      config.jwt.options
    );
    const payload = response.success(token);
    res.json(payload);
  })
);

module.exports = router;

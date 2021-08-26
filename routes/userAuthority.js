const express = require("express");
const createError = require("http-errors");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const config = require("../common/config");
const log = require("../common/log")();
const w = require("../common/wrapper");
const response = require("../common/response");
const { sequelize, model } = require("../common/db");
const authenticate = require("../common/authenticate");

const router = express.Router();
const { User } = model;

const record = {
  authority: {
    list: {
      async select(login_id) {
        const result = await User.findAll({
          paranoid: true,
          attributes: ["login_id"],
          where: { login_id, activate: true },
          include: [
            {
              model: UserAuthority,
              required: false,
              paranoid: true,
              order: [["id", "ASC"]],
            },
          ],
        });
        if (!parent) throw createError(404);
        return result;
      },
      async update(login_id, item) {
        // TODO: 実装中
        throw createError(405);
        const check = await User.findOne({
          paranoid: true,
          attributes: ["login_id"],
          where: { login_id, activate: true },
          include: [
            {
              model: UserAuthority,
              required: false,
              paranoid: true,
              order: [["id", "ASC"]],
            },
          ],
        });
        if (!check) throw createError(404);
        const transaction = await sequelize.transaction();
        try {
          // TODO: ユーザーに紐づく権限を物理削除
          // TODO: ユーザーに紐づく権限を登録
          await transaction.commit();
        } catch (e) {
          await transaction.rollback();
        }
        const result = await User.findOne({
          attributes: ["login_id"],
          where: { login_id },
          include: [
            {
              model: UserAuthority,
              required: false,
              paranoid: true,
              order: [["id", "ASC"]],
            },
          ],
        });
        return result;
      },
    },
  },
};

router.get(
  "/list",
  authenticate.verify,
  authenticate.authority("ANONYMOUS"),
  // TODO: バリデーションチェック
  w((req, res, next) => {
    if (false) throw createError(400);
    next();
  }),
  w(async (req, res, next) => {
    const { login_id } = Object.assign({}, req.body);
    const result = await record.authority.list.select(login_id);
    const payload = response.success(result);
    res.json(payload);
  })
);

router.post(
  "/list",
  authenticate.verify,
  authenticate.authority("ANONYMOUS"),
  // TODO: バリデーションチェック
  w((req, res, next) => {
    if (false) throw createError(400);
    next();
  }),
  w(async (req, res, next) => {
    const { login_id, UserAuthorities } = Object.assign({}, req.body);
    const result = await record.authority.list.update(
      login_id,
      UserAuthorities
    );
    const payload = response.success(result);
    res.json(payload);
  })
);

module.exports = router;

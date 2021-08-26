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
  async insert(item) {
    [
      "id",
      "activate",
      "created_user",
      "created_date",
      "updated_user",
      "updated_date",
      "deleted_user",
      "deleted_date",
      "confirm_password",
    ].forEach((param) => {
      if (param in item) delete item[param];
    });
    const transaction = await sequelize.transaction();
    try {
      const result = await User.create(item, { transaction });
      await transaction.commit();
      return result;
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  },
  async select(login_id) {
    const result = await User.findOne({
      paranoid: true,
      where: { login_id, activate: true },
    });
    if (!result) throw createError(404);
    return result;
  },
  async update(login_id, item) {
    [
      "id",
      "password",
      "created_user",
      "created_date",
      "updated_user",
      "updated_date",
      "deleted_user",
      "deleted_date",
    ].forEach((param) => {
      if (param in item) delete item[param];
    });
    const check = await User.findOne({
      paranoid: true,
      where: { login_id, activate: true },
    });
    if (!check) throw createError(404);
    const transaction = await sequelize.transaction();
    try {
      await User.update(item, { where: { login_id }, transaction });
      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
    const result = await User.findOne({ paranoid: false, where: { login_id } });
    return result;
  },
  async delete(login_id) {
    let check = await User.findOne({
      paranoid: true,
      where: { login_id, activate: true },
    });
    if (!check) throw createError(404);
    const transaction = await sequelize.transaction();
    try {
      await User.destroy({ where: { login_id }, transaction });
      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
    const result = await User.findOne({ paranoid: false, where: { login_id } });
    return result;
  },
  list: {
    async select(where, offset, limit) {
      [
        "id",
        "password",
        "created_user",
        "created_date",
        "updated_user",
        "updated_date",
        "deleted_user",
        "deleted_date",
        "offset",
        "limit",
      ].forEach((param) => {
        if (param in where) delete where[param];
      });
      if (!("activate" in where)) where.activate = true;
      const result = await User.findAll({
        paranoid: true,
        where,
        offset,
        limit,
        order: [[["id", "ASC"]]],
      });
      if (!result) throw createError(404);
      return result;
    },
  },
};

router.post(
  "/",
  authenticate.verify,
  authenticate.authority("ANONYMOUS"),
  // TODO: バリデーションチェック
  w((req, res, next) => {
    if (false) throw createError(400);
    next();
  }),
  w(async (req, res, next) => {
    const item = Object.assign({}, req.body);
    const result = await record.insert(item);
    const payload = response.success(result);
    res.json(payload);
  })
);

router.put(
  "/",
  authenticate.verify,
  authenticate.authority("ANONYMOUS"),
  // TODO: バリデーションチェック
  w((req, res, next) => {
    if (false) throw createError(400);
    next();
  }),
  w(async (req, res, next) => {
    const { login_id } = Object.assign({}, req.body);
    const item = Object.assign({}, req.body);
    const result = await record.update(login_id, item);
    const payload = response.success(result);
    res.json(payload);
  })
);

router.delete(
  "/",
  authenticate.verify,
  authenticate.authority("ANONYMOUS"),
  // TODO: バリデーションチェック
  w((req, res, next) => {
    if (false) throw createError(400);
    next();
  }),
  w(async (req, res, next) => {
    const { login_id } = Object.assign({}, req.body);
    const result = await record.delete(login_id);
    const payload = response.success(result);
    res.json(payload);
  })
);

router.get(
  "/",
  authenticate.verify,
  authenticate.authority("ANONYMOUS"),
  // TODO: バリデーションチェック
  w((req, res, next) => {
    if (false) throw createError(400);
    next();
  }),
  w(async (req, res, next) => {
    const { login_id } = Object.assign({}, req.body);
    const result = await record.select(login_id);
    const payload = response.success(result);
    res.json(payload);
  })
);

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
    const where = Object.assign({}, req.query);
    const offset = req.query.offset || 0;
    const limit = req.query.limit || 100;
    const result = await record.list.select(where, offset, limit);
    const payload = response.success(result);
    res.json(payload);
  })
);

module.exports = router;

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
const { Authority } = model;

const record = {
  list: {
    async select() {
      const result = await Authority.findAll({
        paranoid: true,
        order: [["id", "ASC"]],
      });
      if (!result) throw createError(404);
      return result;
    },
  },
};

router.get(
  "/list",
  authenticate.verify,
  authenticate.authority("ANONYMOUS"),
  w(async (req, res, next) => {
    const result = await record.list.select();
    const payload = response.success(result);
    res.json(payload);
  })
);

module.exports = router;

const express = require("express");

const response = require("../common/response");

const router = express.Router();

router.get("/", (req, res, next) => res.json(response.success({})));

module.exports = router;

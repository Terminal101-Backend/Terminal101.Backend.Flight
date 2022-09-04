const express = require("express");
const router = express.Router({ mergeParams: true });
const { checkAccess, socket } = require("../middlewares");

module.exports = router;

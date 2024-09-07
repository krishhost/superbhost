const express = require("express");
const { createStock, viewStock, sellStock } = require("../Controller/stock");
const { authenticate } = require("../utils/jwt");

const router = express.Router();

router.use(authenticate);
router.post("/create-stock", createStock);
router.post("/view-stock", viewStock);
router.post("/sell-stock", sellStock);

module.exports = router;

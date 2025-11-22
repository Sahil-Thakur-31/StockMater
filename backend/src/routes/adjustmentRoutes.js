const express = require("express");
const { protect } = require("../middleware/auth");
const { createAdjustment } = require("../controllers/adjustmentController");

const router = express.Router();

router.post("/", protect, createAdjustment);

module.exports = router;

const express = require("express");
const { protect } = require("../middleware/auth");
const { getMoveHistory } = require("../controllers/moveHistoryController");

const router = express.Router();

router.get("/", protect, getMoveHistory);

module.exports = router;

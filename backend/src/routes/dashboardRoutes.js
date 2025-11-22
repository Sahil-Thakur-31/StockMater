const express = require("express");
const { protect } = require("../middleware/auth");
const { getKpis } = require("../controllers/dashboardController");

const router = express.Router();

router.get("/kpis", protect, getKpis);

module.exports = router;

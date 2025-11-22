const express = require("express");
const { protect } = require("../middleware/auth");
const {
  createDelivery,
  validateDelivery
} = require("../controllers/deliveryController");

const router = express.Router();

router.post("/", protect, createDelivery);
router.post("/:id/validate", protect, validateDelivery);

module.exports = router;

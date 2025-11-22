const express = require("express");
const { protect } = require("../middleware/auth");
const {
  createTransfer,
  completeTransfer
} = require("../controllers/transferController");

const router = express.Router();

router.post("/", protect, createTransfer);
router.post("/:id/complete", protect, completeTransfer);

module.exports = router;

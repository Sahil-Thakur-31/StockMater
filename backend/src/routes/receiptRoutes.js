const express = require("express");
const { protect } = require("../middleware/auth");
const {
  createReceipt,
  getReceiptsByWarehouse,
  validateReceipt
} = require("../controllers/receiptController");

const router = express.Router();

router.post("/", protect, createReceipt);
router.get("/warehouse/:warehouseId", protect, getReceiptsByWarehouse);
router.post("/:id/validate", protect, validateReceipt);

module.exports = router;

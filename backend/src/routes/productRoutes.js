const express = require("express");
const { protect } = require("../middleware/auth");
const {
  createProduct,
  getProducts,
  updateProduct
} = require("../controllers/productController");

const router = express.Router();

router.post("/", protect, createProduct);
router.get("/", protect, getProducts);
router.put("/:id", protect, updateProduct);

module.exports = router;

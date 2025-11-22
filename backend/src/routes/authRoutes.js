const express = require("express");
const {
  register,
  login,
  requestReset,
  resetPassword,
  updateProfile
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/request-reset", requestReset);
router.post("/reset-password", resetPassword);
router.put("/update-profile", protect, updateProfile);

module.exports = router;

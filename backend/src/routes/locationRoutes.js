const express = require("express");
const { protect } = require("../middleware/auth");
const { getLocations, createLocation } = require("../controllers/locationController");

const router = express.Router();

// GET list of warehouses/locations
router.get("/", protect, getLocations);

// POST to create new location
router.post("/", protect, createLocation);

module.exports = router;

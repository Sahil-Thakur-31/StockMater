const { pool } = require("../config/db");

async function getLocations(req, res) {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, code, address FROM locations ORDER BY name"
    );
    res.json(rows);
  } catch (err) {
    console.error("getLocations error:", err);
    res.status(500).json({ message: "Server error while fetching locations" });
  }
}

async function createLocation(req, res) {
  try {
    const { name, code, address } = req.body;
    if (!name || !code) {
      return res.status(400).json({ message: "name and code required" });
    }

    const [exists] = await pool.execute(
      "SELECT id FROM locations WHERE code = ?",
      [code]
    );
    if (exists.length > 0) {
      return res.status(400).json({ message: "Location code already exists" });
    }

    const [result] = await pool.execute(
      `INSERT INTO locations (name, code, address)
       VALUES (?,?,?)`,
      [name, code, address || null]
    );

    const [row] = await pool.execute(
      "SELECT * FROM locations WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(row[0]);
  } catch (err) {
    console.error("createLocation error:", err);
    res.status(500).json({ message: "Server error while creating location" });
  }
}

module.exports = { getLocations, createLocation };

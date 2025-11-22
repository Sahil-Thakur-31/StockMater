const { pool } = require("../config/db");

async function getMoveHistory(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT sl.id,
              sl.reference_no,
              sl.movement_type,
              p.name AS product_name,
              sl.quantity,
              fl.code AS from_location,
              tl.code AS to_location,
              sl.created_at
       FROM stock_ledger sl
       LEFT JOIN products p ON p.id = sl.product_id
       LEFT JOIN locations fl ON fl.id = sl.from_location_id
       LEFT JOIN locations tl ON tl.id = sl.to_location_id
       ORDER BY sl.created_at DESC`
    );

    res.json(rows);
  } catch (err) {
    console.error("move history error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { getMoveHistory };

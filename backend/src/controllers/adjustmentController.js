const { pool } = require("../config/db");
const { withTransaction } = require("../utils/tx");
const { applyStockDelta, insertLedger } = require("../utils/stock");
const { generateReference } = require("../utils/reference");

async function createAdjustment(req, res) {
  const { product_id, location_id, counted_quantity } = req.body;
  const { reason } = req.body || {};

  if (!product_id || !location_id || counted_quantity === undefined) {
    return res.status(400).json({
      message: "product_id, location_id, counted_quantity are required"
    });
  }

  const referenceNo = generateReference("ADJ");

  const result = await withTransaction(async (conn) => {
    const [stockRows] = await conn.execute(
      "SELECT quantity FROM stock WHERE product_id = ? AND location_id = ? FOR UPDATE",
      [product_id, location_id]
    );

    const systemQty = stockRows.length ? Number(stockRows[0].quantity) : 0;
    const diff = Number(counted_quantity) - systemQty;

    if (diff !== 0) {
      await applyStockDelta(conn, {
        productId: product_id,
        locationId: location_id,
        delta: diff
      });

      await insertLedger(conn, {
        movementType: "ADJUSTMENT",
        referenceNo,
        productId: product_id,
        fromLocationId: diff < 0 ? location_id : null,
        toLocationId: diff > 0 ? location_id : null,
        quantity: Math.abs(diff)
      });
    }

    const [ins] = await conn.execute(
      `INSERT INTO adjustments
       (reference_no, product_id, location_id, counted_quantity, system_quantity, difference)
       VALUES (?,?,?,?,?,?)`,
      [referenceNo, product_id, location_id, counted_quantity, systemQty, diff]
    );

    const [row] = await conn.execute(
      "SELECT * FROM adjustments WHERE id = ?",
      [ins.insertId]
    );
    return row[0];
  });

  res.status(201).json(result);
}

module.exports = { createAdjustment };

// stock.js
/**
 * Ensure a stock row exists, then apply delta to quantity.
 */
async function applyStockDelta(conn, { productId, locationId, delta }) {
  // Upsert stock
  const [rows] = await conn.execute(
    "SELECT id, quantity FROM stock WHERE product_id = ? AND location_id = ? FOR UPDATE",
    [productId, locationId]
  );

  if (rows.length === 0) {
    if (delta < 0) {
      throw new Error("Cannot reduce stock below zero for new location");
    }
    await conn.execute(
      "INSERT INTO stock (product_id, location_id, quantity) VALUES (?,?,?)",
      [productId, locationId, delta]
    );
  } else {
    const current = Number(rows[0].quantity);
    const next = current + Number(delta);
    if (next < 0) {
      throw new Error(
        `Insufficient stock for product ${productId} at location ${locationId}`
      );
    }
    await conn.execute(
      "UPDATE stock SET quantity = ? WHERE id = ?",
      [next, rows[0].id]
    );
  }
}

/**
 * Insert stock_ledger row
 */
async function insertLedger(conn, {
  movementType,
  referenceNo,
  productId,
  fromLocationId,
  toLocationId,
  quantity
}) {
  await conn.execute(
    `INSERT INTO stock_ledger
     (movement_type, reference_no, product_id, from_location_id, to_location_id, quantity)
     VALUES (?,?,?,?,?,?)`,
    [
      movementType,
      referenceNo,
      productId,
      fromLocationId || null,
      toLocationId || null,
      quantity
    ]
  );
}

module.exports = { applyStockDelta, insertLedger };

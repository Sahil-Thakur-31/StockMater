const { pool } = require("../config/db");
const { withTransaction } = require("../utils/tx");
const { generateReference } = require("../utils/reference");
const { applyStockDelta, insertLedger } = require("../utils/stock");

async function createDelivery(req, res) {
  const { customer_name, delivery_date, location_id, items } = req.body;
  // items: [{ product_id, quantity }]

  if (!customer_name || !delivery_date || !location_id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Invalid delivery payload" });
  }

  const referenceNo = generateReference("DO");

  const result = await withTransaction(async (conn) => {
    const [hdr] = await conn.execute(
      `INSERT INTO deliveries (reference_no, customer_name, status, delivery_date)
       VALUES (?,?, 'Draft', ?)`,
      [referenceNo, customer_name, delivery_date]
    );
    const deliveryId = hdr.insertId;

    for (const item of items) {
      await conn.execute(
        `INSERT INTO delivery_items (delivery_id, product_id, quantity)
         VALUES (?,?,?)`,
        [deliveryId, item.product_id, item.quantity]
      );
    }

    const [row] = await conn.execute(
      "SELECT * FROM deliveries WHERE id = ?",
      [deliveryId]
    );
    return row[0];
  });

  res.status(201).json(result);
}

async function validateDelivery(req, res) {
  const id = req.params.id;
  const { location_id } = req.body;

  if (!location_id) {
    return res.status(400).json({ message: "location_id required" });
  }

  const result = await withTransaction(async (conn) => {
    const [hdrs] = await conn.execute(
      "SELECT * FROM deliveries WHERE id = ? FOR UPDATE",
      [id]
    );
    if (hdrs.length === 0) throw new Error("Delivery not found");
    const delivery = hdrs[0];

    if (["Done", "Cancelled"].includes(delivery.status)) {
      throw new Error(`Delivery already ${delivery.status}`);
    }

    const [items] = await conn.execute(
      "SELECT * FROM delivery_items WHERE delivery_id = ?",
      [id]
    );

    for (const item of items) {
      await applyStockDelta(conn, {
        productId: item.product_id,
        locationId: location_id,
        delta: -item.quantity
      });

      await insertLedger(conn, {
        movementType: "DELIVERY",
        referenceNo: delivery.reference_no,
        productId: item.product_id,
        fromLocationId: location_id,
        toLocationId: null,
        quantity: item.quantity
      });
    }

    await conn.execute(
      "UPDATE deliveries SET status = 'Done' WHERE id = ?",
      [id]
    );

    const [updated] = await conn.execute(
      "SELECT * FROM deliveries WHERE id = ?",
      [id]
    );
    return updated[0];
  });

  res.json(result);
}

module.exports = { createDelivery, validateDelivery };

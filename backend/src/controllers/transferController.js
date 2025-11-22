const { pool } = require("../config/db");
const { withTransaction } = require("../utils/tx");
const { generateReference } = require("../utils/reference");
const { applyStockDelta, insertLedger } = require("../utils/stock");

async function createTransfer(req, res) {
  const { from_location_id, to_location_id, transfer_date, items } = req.body;
  // items: [{ product_id, quantity }]

  if (
    !from_location_id ||
    !to_location_id ||
    !transfer_date ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res.status(400).json({ message: "Invalid transfer payload" });
  }

  const referenceNo = generateReference("TRF");

  const result = await withTransaction(async (conn) => {
    const [hdr] = await conn.execute(
      `INSERT INTO transfers (reference_no, from_location_id, to_location_id, status, transfer_date)
       VALUES (?,?,?, 'Draft', ?)`,
      [referenceNo, from_location_id, to_location_id, transfer_date]
    );
    const transferId = hdr.insertId;

    for (const item of items) {
      await conn.execute(
        `INSERT INTO transfer_items (transfer_id, product_id, quantity)
         VALUES (?,?,?)`,
        [transferId, item.product_id, item.quantity]
      );
    }

    const [row] = await conn.execute(
      "SELECT * FROM transfers WHERE id = ?",
      [transferId]
    );
    return row[0];
  });

  res.status(201).json(result);
}

async function completeTransfer(req, res) {
  const id = req.params.id;

  const result = await withTransaction(async (conn) => {
    const [hdrs] = await conn.execute(
      "SELECT * FROM transfers WHERE id = ? FOR UPDATE",
      [id]
    );
    if (hdrs.length === 0) throw new Error("Transfer not found");
    const transfer = hdrs[0];

    if (["Done", "Cancelled"].includes(transfer.status)) {
      throw new Error(`Transfer already ${transfer.status}`);
    }

    const [items] = await conn.execute(
      "SELECT * FROM transfer_items WHERE transfer_id = ?",
      [id]
    );

    for (const item of items) {
      // reduce from from_location
      await applyStockDelta(conn, {
        productId: item.product_id,
        locationId: transfer.from_location_id,
        delta: -item.quantity
      });
      // add to to_location
      await applyStockDelta(conn, {
        productId: item.product_id,
        locationId: transfer.to_location_id,
        delta: item.quantity
      });

      await insertLedger(conn, {
        movementType: "TRANSFER",
        referenceNo: transfer.reference_no,
        productId: item.product_id,
        fromLocationId: transfer.from_location_id,
        toLocationId: transfer.to_location_id,
        quantity: item.quantity
      });
    }

    await conn.execute(
      "UPDATE transfers SET status = 'Done' WHERE id = ?",
      [id]
    );

    const [updated] = await conn.execute(
      "SELECT * FROM transfers WHERE id = ?",
      [id]
    );
    return updated[0];
  });

  res.json(result);
}

module.exports = { createTransfer, completeTransfer };

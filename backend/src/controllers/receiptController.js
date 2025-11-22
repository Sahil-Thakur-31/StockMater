const { pool } = require("../config/db");
const { withTransaction } = require("../utils/tx");
const { generateReference } = require("../utils/reference");
const { applyStockDelta, insertLedger } = require("../utils/stock");

// Create Receipt (draft)
async function createReceipt(req, res) {
  try {
    const { supplier, warehouseId, lines } = req.body; // from frontend

    if (!supplier || !warehouseId || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ message: "supplier, warehouseId, and lines required" });
    }

    // warehouseId = code, need DB location_id
    const [loc] = await pool.execute(
      "SELECT id FROM locations WHERE code = ?",
      [warehouseId]
    );
    if (loc.length === 0) {
      return res.status(400).json({ message: "Invalid warehouseId" });
    }
    const location_id = loc[0].id;

    const referenceNo = generateReference("RCPT");

    const result = await withTransaction(async (conn) => {

      // Create header
      const [header] = await conn.execute(
        `INSERT INTO receipts (reference_no, vendor_name, status, receipt_date, location_id)
         VALUES (?,?, 'Waiting', NOW(), ?)`,
        [referenceNo, supplier, location_id]
      );
      const receiptId = header.insertId;

      for (const line of lines) {
        // You receive SKU – convert to product_id
        const [prod] = await conn.execute(
          "SELECT id FROM products WHERE sku = ?",
          [line.sku]
        );
        if (prod.length === 0) {
          throw new Error(`Product not found: ${line.sku}`);
        }

        const productId = prod[0].id;

        await conn.execute(
          `INSERT INTO receipt_items (receipt_id, product_id, quantity)
           VALUES (?,?,?)`,
          [receiptId, productId, line.quantity]
        );
      }

      const [created] = await conn.execute(
        "SELECT * FROM receipts WHERE id = ?",
        [receiptId]
      );
      return created[0];
    });

    res.status(201).json(result);

  } catch (err) {
    console.error("createReceipt err:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
}

// Fetch receipts by warehouse
async function getReceiptsByWarehouse(req, res) {
  try {
    const warehouseCode = req.params.warehouseId;

    // Find actual location_id
    const [loc] = await pool.execute(
      "SELECT id FROM locations WHERE code = ?",
      [warehouseCode]
    );

    if (loc.length === 0) {
      return res.json([]);
    }

    const locationId = loc[0].id;

    const [rows] = await pool.execute(
      `SELECT r.id,
              r.reference_no AS reference,
              r.vendor_name AS supplier,
              r.status,
              r.location_id AS warehouse_id,
              (SELECT COUNT(*) FROM receipt_items ri WHERE ri.receipt_id = r.id) AS linesCount
       FROM receipts r
       WHERE r.location_id = ?
       ORDER BY r.created_at DESC`,
      [locationId]
    );

    res.json(rows);
  } catch (err) {
    console.error("getReceiptsByWarehouse:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// Validate Receipt (apply stock)
async function validateReceipt(req, res) {
  try {
    const id = req.params.id;

    const updated = await withTransaction(async (conn) => {
      const [headers] = await conn.execute(
        "SELECT * FROM receipts WHERE id = ? FOR UPDATE",
        [id]
      );
      if (headers.length === 0) throw new Error("Receipt not found");
      const receipt = headers[0];

      if (receipt.status === "Done") throw new Error("Already validated");

      const [items] = await conn.execute(
        "SELECT * FROM receipt_items WHERE receipt_id = ?",
        [id]
      );

      for (const item of items) {
        await applyStockDelta(conn, {
          productId: item.product_id,
          locationId: receipt.warehouse_id,
          delta: item.quantity
        });

        await insertLedger(conn, {
          movementType: "RECEIPT",
          referenceNo: receipt.reference,
          productId: item.product_id,
          fromLocationId: null,
          toLocationId: receipt.warehouse_id,
          quantity: item.quantity
        });
      }

      await conn.execute("UPDATE receipts SET status = 'Done' WHERE id = ?", [id]);

      const [row] = await conn.execute("SELECT * FROM receipts WHERE id = ?", [id]);
      return row[0];
    });

    res.json(updated);
  } catch (err) {
    console.error("validateReceipt error:", err);
    res.status(400).json({ message: err.message });
  }
}

module.exports = { createReceipt, getReceiptsByWarehouse, validateReceipt };

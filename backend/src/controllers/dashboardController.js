const { pool } = require("../config/db");

async function getKpis(req, res) {
  const [[{ totalProducts }]] = await pool.query(
    "SELECT COUNT(*) AS totalProducts FROM products"
  );

  const [[{ lowStockCount }]] = await pool.query(
    `SELECT COUNT(*) AS lowStockCount
     FROM (
       SELECT product_id, SUM(quantity) AS qty
       FROM stock
       GROUP BY product_id
       HAVING qty <= 10
     ) t`
  );

  const [[{ pendingReceipts }]] = await pool.query(
    `SELECT COUNT(*) AS pendingReceipts
     FROM receipts
     WHERE status IN ('Draft','Waiting','Ready')`
  );

  const [[{ pendingDeliveries }]] = await pool.query(
    `SELECT COUNT(*) AS pendingDeliveries
     FROM deliveries
     WHERE status IN ('Draft','Waiting','Ready')`
  );

  const [[{ scheduledTransfers }]] = await pool.query(
    `SELECT COUNT(*) AS scheduledTransfers
     FROM transfers
     WHERE status IN ('Draft','Waiting','Ready')`
  );

  res.json({
    totalProducts,
    lowStockCount,
    pendingReceipts,
    pendingDeliveries,
    scheduledTransfers
  });
}

module.exports = { getKpis };

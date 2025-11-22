const { pool } = require("../config/db");

// Helper: find or insert CATEGORY by name
async function resolveCategoryId(category) {
  if (!category) return null;

  const [rows] = await pool.execute(
    "SELECT id FROM product_categories WHERE name = ?",
    [category]
  );
  if (rows.length > 0) return rows[0].id;

  const [result] = await pool.execute(
    "INSERT INTO product_categories (name) VALUES (?)",
    [category]
  );
  return result.insertId;
}

// Helper: find or insert UNIT by abbreviation
async function resolveUnitId(uom) {
  if (!uom) return null;

  const [rows] = await pool.execute(
    "SELECT id FROM units WHERE abbreviation = ?",
    [uom]
  );
  if (rows.length > 0) return rows[0].id;

  const [result] = await pool.execute(
    "INSERT INTO units (name, abbreviation) VALUES (?,?)",
    [uom, uom]
  );
  return result.insertId;
}

async function createProduct(req, res) {
  try {
    const { name, sku, category, uom, initialStock } = req.body;

    if (!name || !sku) {
      return res.status(400).json({ message: "name and sku required" });
    }

    // Check duplicate SKU
    const [exists] = await pool.execute(
      "SELECT id FROM products WHERE sku = ?",
      [sku]
    );
    if (exists.length > 0) {
      return res.status(400).json({ message: "SKU already exists" });
    }

    // Convert category + uom to IDs
    const categoryId = await resolveCategoryId(category);
    const unitId = await resolveUnitId(uom);

    // Create product
    const [result] = await pool.execute(
      `INSERT INTO products (name, sku, category_id, unit_id)
       VALUES (?,?,?,?)`,
      [name, sku, categoryId, unitId]
    );

    const productId = result.insertId;

    // Apply initial stock if provided
    if (initialStock && Number(initialStock) > 0) {
      await pool.execute(
        "INSERT INTO stock (product_id, location_id, quantity) VALUES (?,?,?)",
        [productId, "MAIN", Number(initialStock)]
      );
    }

    const [rows] = await pool.execute(
      "SELECT *, ? AS currentStock FROM products WHERE id = ?",
      [initialStock || 0, productId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("createProduct err:", err);
    res.status(500).json({ message: "Server error" });
  }
}

async function getProducts(req, res) {
  const [rows] = await pool.execute(
    `SELECT p.id, p.name, p.sku,
            p.category_id, p.unit_id,
            COALESCE(SUM(s.quantity),0) AS currentStock
     FROM products p
     LEFT JOIN stock s ON s.product_id = p.id
     GROUP BY p.id
     ORDER BY p.name`
  );
  res.json(rows);
}

async function updateProduct(req, res) {
  try {
    const id = req.params.id;
    const { name, sku, category, uom } = req.body;

    const [existing] = await pool.execute(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: "Not found" });
    }

    // Resolve category + unit if changed
    const categoryId = await resolveCategoryId(category);
    const unitId = await resolveUnitId(uom);

    await pool.execute(
      `UPDATE products SET name = ?, sku = ?, category_id = ?, unit_id = ?
       WHERE id = ?`,
      [
        name || existing[0].name,
        sku || existing[0].sku,
        categoryId || existing[0].category_id,
        unitId || existing[0].unit_id,
        id,
      ]
    );

    const [updated] = await pool.execute(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );
    res.json(updated[0]);
  } catch (err) {
    console.error("updateProduct err:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { createProduct, getProducts, updateProduct };

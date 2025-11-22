const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

async function protect(req, res, next) {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.execute(
      "SELECT id, name, email FROM users WHERE id = ?",
      [decoded.id]
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = rows[0];
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
}

module.exports = { protect };

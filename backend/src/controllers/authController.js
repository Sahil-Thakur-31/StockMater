const { pool } = require("../config/db");
const { hashPassword, comparePassword, generateToken } = require("../utils/password");

async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: "name, email, password required" });

  const [existing] = await pool.execute(
    "SELECT id FROM users WHERE email = ?",
    [email]
  );
  if (existing.length > 0) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashed = await hashPassword(password);
  const [result] = await pool.execute(
    "INSERT INTO users (name, email, password) VALUES (?,?,?)",
    [name, email, hashed]
  );

  const userId = result.insertId;

  res.status(201).json({
    id: userId,
    name,
    email,
    token: generateToken(userId)
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  const [rows] = await pool.execute(
    "SELECT id, name, email, password FROM users WHERE email = ?",
    [email]
  );
  if (rows.length === 0) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const user = rows[0];
  const match = await comparePassword(password, user.password);
  if (!match) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    token: generateToken(user.id)
  });
}

async function requestReset(req, res) {
  const { email } = req.body;
  const [users] = await pool.execute(
    "SELECT id FROM users WHERE email = ?",
    [email]
  );
  if (users.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }
  const userId = users[0].id;
  const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  await pool.execute(
    `INSERT INTO password_reset_requests (user_id, otp, expires_at)
     VALUES (?,?,?)`,
    [userId, otp, expiresAt]
  );

  console.log(`OTP for password reset (${email}): ${otp}`);

  res.json({ message: "OTP generated (logged on server for demo)" });
}

async function resetPassword(req, res) {
  const { email, otp, newPassword } = req.body;

  const [users] = await pool.execute(
    "SELECT id FROM users WHERE email = ?",
    [email]
  );
  if (users.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }
  const userId = users[0].id;

  const [requests] = await pool.execute(
    `SELECT id, otp, expires_at, is_used
     FROM password_reset_requests
     WHERE user_id = ?
     ORDER BY id DESC
     LIMIT 1`,
    [userId]
  );

  if (requests.length === 0) {
    return res.status(400).json({ message: "No reset request found" });
  }

  const reqRow = requests[0];
  const now = new Date();

  if (reqRow.is_used || reqRow.otp !== otp || now > reqRow.expires_at) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  const hashed = await hashPassword(newPassword);

  await pool.execute("UPDATE users SET password = ? WHERE id = ?", [
    hashed,
    userId
  ]);

  await pool.execute(
    "UPDATE password_reset_requests SET is_used = TRUE WHERE id = ?",
    [reqRow.id]
  );

  res.json({ message: "Password reset successful" });
}

async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "name and email required" });
    }

    // Check if email already belongs to another user
    const [exists] = await pool.execute(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [email, userId]
    );
    if (exists.length > 0) {
      return res.status(400).json({ message: "Email already in use by another account" });
    }

    await pool.execute(
      "UPDATE users SET name = ?, email = ? WHERE id = ?",
      [name, email, userId]
    );

    return res.json({
      id: userId,
      name,
      email,
      token: generateToken(userId) // keep user logged in
    });
  } catch (err) {
    console.error("profile update err", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { register, login, requestReset, resetPassword, updateProfile };

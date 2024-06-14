import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sql_db } from "../db.js";

const router = express.Router();

// Register route
router.post("/register", async (req, res) => {
  try {
    const { username, password, userType } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query =
      "INSERT INTO users (username, password, userType) VALUES (?, ?, ?)";
    sql_db.query(query, [username, hashedPassword, userType], (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Error registering user" });
      }
      res.status(201).json({ message: "User registered successfully" });
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const query = "SELECT * FROM users WHERE username = ?";
    sql_db.query(query, [username], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Error logging in" });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, userType: user.userType },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      res.json({ token });
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all users
router.get("/", (req, res) => {
  sql_db.query("SELECT * FROM users", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get a user by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  sql_db.query("SELECT * FROM users WHERE id = ?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(results[0]);
  });
});

// Update a user by ID
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { username, password, userType } = req.body;
  sql_db.query(
    "UPDATE users SET username = ?, password = ?, userType = ? WHERE id = ?",
    [username, password, userType, id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User updated successfully" });
    }
  );
});

// Delete a user by ID
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  sql_db.query("DELETE FROM users WHERE id = ?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  });
});

export default router;

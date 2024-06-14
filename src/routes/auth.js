import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sql_db } from "../db.js";
import verifyToken from "../middleware/verifyToken.js";
import crypto from "crypto"; // Import the crypto module

const router = express.Router();

// Function to generate a random username
const generateUsername = () => {
  return `mlab_${crypto.randomBytes(4).toString('hex')}`;
};

// Function to generate JWT token
const generateToken = (userId, userType) => {
  return jwt.sign(
    {
      id: userId,
      userType: userType,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

router.post("/signup", (req, res) => {
  const { identifier, password, confirmPassword, userType } = req.body;

  if (!identifier || !password || !confirmPassword || !userType) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const checkUserQuery =
    "SELECT * FROM users WHERE email = ? OR phone = ? OR username = ?";
  const checkUserParams = [identifier, identifier, identifier];

  sql_db.query(checkUserQuery, checkUserParams, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length > 0) {
      return res
        .status(400)
        .json({ message: "Email, phone, or username already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const generatedUsername = generateUsername();

    let insertUserQuery;
    let insertUserParams;

    if (identifier.includes("@mlab.com")) {
      insertUserQuery =
        "INSERT INTO users (email, password, userType, username) VALUES (?, ?, ?, ?)";
      insertUserParams = [identifier, hashedPassword, userType, generatedUsername];
    } else if (/^\d+$/.test(identifier) && (identifier.length > 7)) {
      insertUserQuery =
        "INSERT INTO users (phone, password, userType, username) VALUES (?, ?, ?, ?)";
      insertUserParams = [identifier, hashedPassword, userType, generatedUsername];
    } else {
      return res.status(400).json({ message: "Invalid identifier format", suggestion: "Use a valid email or phone number" });
    }

    sql_db.query(insertUserQuery, insertUserParams, (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Generate token after successful signup
      const userId = result.insertId; // assuming your user ID column is auto-increment
      const token = generateToken(userId, userType);

      res.status(201).json({ message: "User created successfully", token });
    });
  });
});

router.post("/signin", (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res
      .status(400)
      .json({ message: "Identifier and password are required" });
  }

  const query =
    "SELECT * FROM users WHERE email = ? OR phone = ? OR username = ?";
  const queryParams = [identifier, identifier, identifier];

  sql_db.query(query, queryParams, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message }); // Improved error handling
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = results[0];

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }


    const token = generateToken(user.id, user.userType);

    res.status(201).json({ message: "User SignIn successfully", token });

    
    // const token = jwt.sign(
    //   {
    //     id: user.id,
    //     userType: user.userType,
    //     },
    //     process.env.JWT_SECRET,
    //     { expiresIn: "1h" }
    //     );
    // res.json({ token });
  });
});

router.get("/all-users", verifyToken, (req, res) => {
  sql_db.query("SELECT * FROM users", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message }); // Improved error handling
    }
    res.json(results);
  });
});

router.get("/user/:id", (req, res) => {
  const { id } = req.params;
  sql_db.query("SELECT * FROM users WHERE id = ?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message }); // Improved error handling
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(results[0]);
  });
});

router.put("/user/:id", async (req, res) => {
  const { id } = req.params;
  const { username, password, userType } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10); // Changed to async/await syntax

  sql_db.query(
    "UPDATE users SET username = ?, password = ?, userType = ? WHERE id = ?",
    [username, hashedPassword, userType, id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message }); // Improved error handling
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User updated successfully" });
    }
  );
});

router.delete("/user/:id", (req, res) => {
  const { id } = req.params;
  sql_db.query("DELETE FROM users WHERE id = ?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message }); // Improved error handling
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  });
});

export default router;


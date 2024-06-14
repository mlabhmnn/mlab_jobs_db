import express from "express";
import mysql from "mysql2";
import bcrypt from "bcrypt";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import path from "path";
import nodemailer from "nodemailer";

import verifyToken from "./src/middleware/verifyToken.js";
import { randomUUID } from "crypto";

dotenv.config(); // Load environment variables from .env

const app = express();

const port = process.env.S_PORT;
const jwtSecretKey = process.env.JWTSecretKey;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Get the absolute path to the directory
const __dirname = path.resolve();
// Serve static files from the "asset" directory
app.use(express.static(path.join(__dirname, "src", "asset")));
// Get the directory name
// const __dirname = path.dirname(new URL(import.meta.url).pathname);
app.use(express.static(path.join(__dirname, "M_Server")));
// Create a connection to your MySQL database

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST, //  host: "localhost",
  user: process.env.DB_USER, // user: "root",
  password: process.env.DB_PASSWORD, // password: "mlab",
  database: process.env.DB_DATABASE, // database: "mlab"
});

// console.log(nodemailer);

const sendConfirmationEmail = (email) => {
  const token = jwt.sign({ email }, "your_secret_key", { expiresIn: "1h" });
  const confirmationLink = `http://localhost:${S_PORT}/activate/${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "htoomyatnyinyi@gmail.com",
      pass: "281fe2f0",
    },
  });

  nodemailer.createTestAccount();
};

// Create the messages table if it doesn't exist
db.query(
  `
  CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`,
  (err) => {
    if (err) {
      console.error("Error creating messages table:", err.stack);
    } else {
      console.log("Messages table exists or created successfully");
    }
  }
);

// app.get("/messages", (req, res) => {
//   db.query("SELECT * FROM messages", (err, results) => {
//     if (err) {
//       console.error("Error fetching messages:", err.stack);
//       res.status(500).json({ error: "Failed to fetch messages" });
//     } else {
//       res.json(results);
//     }
//   });
// });

app.get("/messages", (req, res) => {
  db.query("SELECT * FROM messages", (err, results) => {
    if (err) {
      console.error("Error fetching messages:", err.stack);
      return res.status(500).json({ error: "Failed to fetch messages" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No messages found" });
    }

    res.json(results);
  });
});

app.post("/messages", (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: "Content is required" });
  }

  db.query(
    "INSERT INTO messages (content) VALUES (?)",
    [content],
    (err, results) => {
      if (err) {
        console.error("Error inserting message:", err.stack);
        res.status(500).json({ error: "Failed to insert message" });
      } else {
        const newMessage = {
          id: results.insertId,
          content,
          timestamp: new Date(),
        };
        res.status(201).json(newMessage);
      }
    }
  );
});

// Sample data
const data = [];

// Example protected route
app.get("/api/data", verifyToken, (req, res) => {
  // console.log(randomUUID());

  res.json({ message: "This is protected data", user: req.user, data });
});

app.post("/api/data", verifyToken, (req, res) => {
  const newData = req.body;
  console.log(newData);

  // Generate a unique ID for the new data
  // const newId = data.length > 0 ? data[data.length - 1].id + 1 : 1;
  const newId = randomUUID();

  // Assign the new ID to the newData object
  newData.id = newId;

  data.push(newData);
  // Push the newData object to the data array

  // Send response
  res.json({ message: "Data received and added", user: req.user, newData });
  // console.log(req.body, req.user, "from fe sendData Thhunks");
  // res.json({ message: "Data received", user: req.user, user: req.body });
});

// const db_ = `SELECT * FROM ${database}`
// db.query(db_, )

// Route to get data
// app.get("/api/data", verifyToken, (req, res) => {
//   res.json(data);
// });

app.get("/mlab/image", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "asset", "uploads", "11.jpg"));
});

app.post("/mlab/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log(email, password);
    // Find the user in the MySQL database
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (error, results) => {
        if (error) {
          console.error("MySQL query error:", error);
          res.status(500).json({ error: "Internal server error" });
        } else {
          const user = results[0];

          if (user) {
            // Compare the provided password with the hashed password in the database
            const isPasswordMatch = await bcrypt.compare(
              password,
              user.password
            );

            if (isPasswordMatch) {
              // Generate a JWT token
              const token = jwt.sign(
                { userId: user.id, email: user.email },
                jwtSecretKey,
                { expiresIn: "1h" }
              );

              res.json({ token });
            } else {
              res.status(401).json({ error: "Invalid credentials" });
            }
          } else {
            res.status(401).json({ error: "Invalid credentials" });
          }
        }
      }
    );
  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log(email, password);
    // Find the user in the MySQL database
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (error, results) => {
        if (error) {
          console.error("MySQL query error:", error);
          res.status(500).json({ error: "Internal server error" });
        } else {
          const user = results[0];

          if (user) {
            // Compare the provided password with the hashed password in the database
            const isPasswordMatch = await bcrypt.compare(
              password,
              user.password
            );

            if (isPasswordMatch) {
              // Generate a JWT token
              const token = jwt.sign(
                { userId: user.id, email: user.email },
                jwtSecretKey,
                { expiresIn: "1h" }
              );

              res.json({ token });
            } else {
              res.status(401).json({ error: "Invalid credentials" });
            }
          } else {
            res.status(401).json({ error: "Invalid credentials" });
          }
        }
      }
    );
  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/mlab/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const checkMail = `SELECT * FROM ${process.env.dbt_name} WHERE email = ?`;

    db.query(
      checkMail,
      // "SELECT * FROM users WHERE email = ?",
      [email],
      async (error, results) => {
        if (error) {
          console.error("MySQL query error:", error);
          res.status(500).json({ error: "Internal server error" });
        } else {
          if (results.length > 0) {
            // User with this email already exists
            res
              .status(400)
              .json({ error: "User already exists with this email" });
          } else {
            // Hash the password before storing it in the database
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert the new user into the database
            const insertUser = `INSERT INTO ${process.env.dbt_name} (username, email, password) VALUES (?, ?, ?)`;

            // db.query("INSERT INTO users (username, password, email) VALUES (?, ?, ?)",[username, hashedPassword, email], and so on..
            db.query(
              insertUser,
              [username, email, hashedPassword],
              (insertError, insertResults) => {
                if (insertError) {
                  console.error("MySQL insert error:", insertError);
                  res
                    .status(500)
                    .json({ error: "Internal mysql server error" });
                } else {
                  // Generate a JWT token for the new user
                  const token = jwt.sign(
                    { userId: insertResults.insertId, email },
                    jwtSecretKey,
                    { expiresIn: "1h" }
                  );

                  res
                    .status(201)
                    .json({ message: "User registered successfully", token });
                }
              }
            );
          }
        }
      }
    );
  } catch (error) {
    console.error("Registration failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// app.post("/mlab/signup", async (req, res) => {
//   // Use the authorizeRoles middleware to restrict access to this endpoint
//   const { username, email, password } = req.body;
//   console.log(req.body)

//   try {
//     db.query(
//       "SELECT * FROM users WHERE email = ?",
//       [email],
//       async (error, results) => {
//         if (error) {
//           console.error("MySQL query error:", error);
//           res.status(500).json({ error: "Internal server error" });
//         } else {
//           if (results.length > 0) {
//             // User with this email already exists
//             res
//               .status(400)
//               .json({ error: "User already exists with this email" });
//           } else {
//             // Hash the password before storing it in the database
//             const hashedPassword = await bcrypt.hash(password, 10);

//             // Insert the new user into the database
//             db.query(
//               "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
//               [username, hashedPassword, email],
//               (insertError, insertResults) => {
//                 if (insertError) {
//                   console.error("MySQL insert error:", insertError);
//                   res.status(500).json({ error: "Internal server error" });
//                 } else {
//                   res
//                   .status(201)
//                   .json({ message: "User registered successfully" });
//                   // const token = jwt.sign(
//                   //   { userId: user.id, email: user.email },
//                   //   jwtSecretKey,
//                   //   { expiresIn: "1h" }
//                   // );
//                   // res.json({ token });
//                 }
//               }
//             );
//           }
//         }
//       }
//     );
//   } catch (error) {
//     console.error("Registration failed:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// jwTtoken
// app.post("/mlab/signup", authorizeRoles(["admin"]), async (req, res) => {});
// Add a middleware function for role-based authorization
// const authorizeRoles = (roles) => {
//   return (req, res, next) => {
//     const userRole = req.user.role;
//     if (roles.includes(userRole)) {
//       next();
//     } else {
//       res.status(403).json({ error: "Forbidden" });
//     }
//   };
// };
// app.get("/", authorizeRoles(["user", "admin"]), (req, res) => {
//   res.json({ message: "hello" });
// });
// #######################
// Middleware function to verify JWT token

// function verifyToken(req, res, next) {
//   const authHeader = req.headers.authorization;   // Extract JWT token from Authorization header

//   // Check if Authorization header exists and starts with "Bearer "
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     // If not, send 401 (Unauthorized) response
//     return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
//   }

//   // Extract the token from the Authorization header
//   const token = authHeader.split(' ')[1];
//   // Verify the JWT token
//   jwt.verify(token, jwtSecretKey, (err, decoded) => {
//     // If verification fails due to expiration, send 401 (Unauthorized) response
//     if (err && err.name === 'TokenExpiredError') {
//       return res.status(401).json({ error: 'Unauthorized: Token expired' });
//     }
//     // If verification fails due to other reasons, send 401 (Unauthorized) response
//     if (err) {
//       return res.status(401).json({ error: 'Unauthorized: Invalid token' });
//     }

//     // If token is valid, attach decoded user information to request object
//     req.user = decoded;

//     // Call next middleware function or route handler
//     next();
//   });
// }

app.get("/mlab/data", verifyToken, (req, res) => {
  res.status(200).json({ message: "Do not tell to anyone. he" });
});

app.get("/mlab/post", verifyToken, (req, res) => {
  try {
    res.send({ users: ["mi", "ei", "ci", "ii"] });
  } catch (log) {
    console.error(log);
  }
});

// POST endpoint for user signout with middleware
app.post("/mlab/signout", verifyToken, (req, res) => {
  // Signout logic can be performed here, if needed
  console.log("It worked!");

  // Send 200 (OK) response indicating successful signout
  res.status(200).json({ message: "User signed out successfully" });
});

// DELETE endpoint for deleting a user
app.delete("/mlab/delete-user", verifyToken, (req, res) => {
  // Extract user id from the decoded JWT token
  console.log(req.user.email, req.user.connection);
  const userEmail = req.user.email;
  // Query the database to delete the user
  db.query(
    "DELETE FROM users WHERE email = ?",
    [userEmail],
    (error, result) => {
      if (error) {
        console.error("MySQL delete error:", error);
        return res.status(500).json({ error: "Internal server error" });
      }

      // Check if any rows were affected (if user existed and was deleted)
      if (result.affectedRows > 0) {
        return res.status(204).end(); // User deleted successfully
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    }
  );
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack);
  } else {
    console.log("Connected to the database!" + db.threadId);
  }
});

app.listen(port, () => {
  console.log(`SERVER_IS_RUNNING_ON_PORT_${port}`);
});

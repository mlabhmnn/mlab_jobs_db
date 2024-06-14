// import express from "express";
// import mysql from "mysql2";
// import bcrypt from "bcrypt";
// import cors from "cors";
// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";
// import bodyParser from "body-parser";

// dotenv.config(); // Load environment variables from .env

// const app = express();
// const port = process.env.S_PORT;
// const jwtSecretKey = process.env.JWTSecretKey;

// app.use(cors());
// app.use(express.json());
// app.use(bodyParser.json());

// // Create a connection to your MySQL database
// export const db = mysql.createConnection({
//   host: process.env.DB_HOST, //  host: "localhost",
//   user: process.env.DB_USER,  // user: "root",
//   password: process.env.DB_PASSWORD,  // password: "mlab",
//   database: process.env.DB_DATABASE,  // database: "mlab"
// });

// app.post("/mlab/signin", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Find the user in the MySQL database
//     db.query(
//       "SELECT * FROM users WHERE email = ?",
//       [email],
//       async (error, results) => {
//         if (error) {
//           console.error("MySQL query error:", error);
//           res.status(500).json({ error: "Internal server error" });
//         } else {
//           const user = results[0];

//           if (user) {
//             // Compare the provided password with the hashed password in the database
//             const isPasswordMatch = await bcrypt.compare(
//               password,
//               user.password
//             );

//             if (isPasswordMatch) {
//               // Generate a JWT token
//               const token = jwt.sign(
//                 { userId: user.id, email: user.email },
//                 jwtSecretKey,
//                 { expiresIn: "1h" }
//               );

//               res.json({ token });
//             } else {
//               res.status(401).json({ error: "Invalid credentials" });
//             }
//           } else {
//             res.status(401).json({ error: "Invalid credentials" });
//           }
//         }
//       }
//     );
//   } catch (error) {
//     console.error("Login failed:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// app.post("/mlab/signup", async (req, res) => {
//   // Use the authorizeRoles middleware to restrict access to this endpoint
//   const { username, email, password } = req.body;

//   try {
//     // Check if the user with the given email already exists
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
//                     .status(201)
//                     .json({ message: "User registered successfully" });
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

// // app.post("/mlab/signup", authorizeRoles(["admin"]), async (req, res) => {});
// // Add a middleware function for role-based authorization
// // const authorizeRoles = (roles) => {
// //   return (req, res, next) => {
// //     const userRole = req.user.role;
// //     if (roles.includes(userRole)) {
// //       next();
// //     } else {
// //       res.status(403).json({ error: "Forbidden" });
// //     }
// //   };
// // };
// // app.get("/", authorizeRoles(["user", "admin"]), (req, res) => {
// //   res.json({ message: "hello" });
// // });

// // Middleware function to verify JWT token
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
// app.get('/mlab/data', verifyToken, (req, res) => {
//   res.status(200).json({message: "Do not tell to anyone."})
// })

// // POST endpoint for user signout with middleware
// app.post('/mlab/signout', verifyToken, (req, res) => {
//   // Signout logic can be performed here, if needed
//   console.log('It worked!')

//   // Send 200 (OK) response indicating successful signout
//   res.status(200).json({ message: 'User signed out successfully' });
// });

// db.connect((err) => {
//   if (err) {
//     console.error("Error connecting to the database:", err);
//   } else {
//     console.log("Connected to the database!");
//   }
// });

// app.listen(port, () => {
//   console.log(`SERVER_IS_RUNNING_ON_PORT_${port}`);
// });

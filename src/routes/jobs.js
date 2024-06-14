import express from "express";
import { sql_db } from "../db.js";
// import { v4 as uuidv4 } from "uuid";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Get all job postings
router.get("/allposting", verifyToken, (req, res) => {
  sql_db.query("SELECT * FROM job_postings", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // console.log(results)
    res.json(results);
  });
});

// Create a new job posting
router.post("/create-posting", verifyToken, (req, res) => {
  const { title, description, requirements, salary, location } = req.body;
  sql_db.query(
    "INSERT INTO job_postings (title, description, requirements, salary, location) VALUES (?, ?, ?, ?, ?)",
    [title, description, requirements, salary, location],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: results.insertId }); // Assuming you want to return the ID of the inserted row
    }
  );

  // POST http://localhost:8080/create-posting
  // Content-Type: application/json
  // Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlclR5cGUiOiJlbXBsb3llciIsImlhdCI6MTcxNzkzOTM5NSwiZXhwIjoxNzE3OTQyOTk1fQ.KzhNOJU0NsZhJpTTlxMoQOy1pWra-RBXNkfk9NvWzQI

  // {
  //   "title": "Software Engineer",
  //   "description": "Join our team as a Software Engineer",
  //   "requirements": "Bachelor's degree in Computer Science, 3+ years of experience in software development",
  //   "additionalRequirements": [
  //     "Experience with JavaScript frameworks (e.g., React, Angular)",
  //     "Strong problem-solving skills"
  //   ],
  //   "salary": "$100,000 per year",
  //   "location": "New York"
  // }
});

// Get a job posting by ID
router.get("/post/:id", (req, res) => {
  const { id } = req.params;
  sql_db.query(
    "SELECT * FROM job_postings WHERE id = ?",
    [id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "Job posting not found" });
      }
      res.json(results[0]);
    }
  );
});

// Update a job posting by ID
router.put("/post/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const { title, description, requirements, salary, location } = req.body;
  sql_db.query(
    "UPDATE job_postings SET title = ?, description = ?, requirements = ?, salary = ?, location = ? WHERE id = ?",
    [title, description, requirements, salary, location, id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Job posting not found" });
      }
      res.json({ message: "Job posting updated successfully" });
    }
  );
});

// Delete a job posting by ID
router.delete("/post/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  sql_db.query(
    "DELETE FROM job_postings WHERE id = ?",
    [id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Job posting not found" });
      }
      res.json({ message: "Job posting deleted successfully" });
    }
  );
});

export default router;

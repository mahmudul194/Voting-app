require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
  console.log("✅ Connected to MySQL database");
  connection.release();
});

/* ========================
   Vote
======================== */
app.post('/vote', (req, res) => {
  const { candidate } = req.body;

  if (!candidate) {
    return res.status(400).json({ error: "Candidate required" });
  }

  const allowedCandidates = ['Sabreena', 'Azaz'];

  if (!allowedCandidates.includes(candidate)) {
    return res.status(400).json({ error: "Invalid candidate" });
  }

  db.query(
    "UPDATE votes SET vote_count = vote_count + 1 WHERE candidate = ?",
    [candidate],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Vote failed" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Candidate not found in DB" });
      }

      res.json({ success: true, message: `Vote recorded for ${candidate}` });
    }
  );
});

/* ========================
   Remove Vote
======================== */
app.post('/removeVote', (req, res) => {
  const { candidate } = req.body;

  if (!candidate) {
    return res.status(400).json({ error: "Candidate required" });
  }

  db.query(
    "UPDATE votes SET vote_count = vote_count - 1 WHERE candidate = ? AND vote_count > 0",
    [candidate],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Remove failed" });
      }

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "No vote to remove" });
      }

      res.json({ success: true, message: `Vote removed for ${candidate}` });
    }
  );
});

/* ========================
   Results
======================== */
app.get('/results', (req, res) => {
  db.query("SELECT candidate, vote_count FROM votes", (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch results" });
    }

    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
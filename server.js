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

/* ===========================
   Database Connection
=========================== */
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

/* ===========================
   Vote API
=========================== */
app.post('/vote', (req, res) => {
  const { candidate } = req.body;

  if (!candidate) {
    return res.status(400).json({ error: "Candidate name is required." });
  }

  const query = `
    UPDATE votes 
    SET vote_count = vote_count + 1 
    WHERE candidate = ?
  `;

  db.query(query, [candidate], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error recording vote." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Candidate not found." });
    }

    res.json({ success: true, message: `Vote recorded for ${candidate}` });
  });
});

/* ===========================
   Remove Vote API
=========================== */
app.post('/removeVote', (req, res) => {
  const { candidate } = req.body;

  if (!candidate) {
    return res.status(400).json({ error: "Candidate name is required." });
  }

  const query = `
    UPDATE votes 
    SET vote_count = vote_count - 1 
    WHERE candidate = ? AND vote_count > 0
  `;

  db.query(query, [candidate], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error removing vote." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Candidate not found or no votes left." });
    }

    res.json({ success: true, message: `Vote removed for ${candidate}` });
  });
});

/* ===========================
   Get Results API
=========================== */
app.get('/results', (req, res) => {
  db.query("SELECT candidate, vote_count FROM votes", (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error fetching results." });
    }

    res.json(rows);
  });
});

/* ===========================
   Root Route
=========================== */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
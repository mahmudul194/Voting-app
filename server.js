require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MySQL Pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Test DB connection
db.getConnection()
  .then(conn => {
    console.log('Connected to MySQL DB');
    conn.release();
  })
  .catch(err => {
    console.error('DB connection error:', err);
    process.exit(1);
  });

/* ===========================
   STUDENT LOGIN
=========================== */
app.post("/login", async (req, res) => {
  const { name, student_id, section, batch } = req.body;

  if (!name || !student_id || !section || !batch)
    return res.status(400).json({ error: "All fields required" });

  if (section.toUpperCase() !== "L")
    return res.status(403).json({ error: "Only Section L allowed" });

  try {
    const [rows] = await db.query("SELECT * FROM students WHERE student_id = ?", [student_id]);
    if (rows.length === 0) return res.status(403).json({ error: "Student not found" });
    if (rows[0].name !== name || rows[0].batch !== batch)
      return res.status(403).json({ error: "Student info mismatch" });

    res.json({ success: true, message: "Login successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ===========================
   VOTE
=========================== */
app.post("/vote", async (req, res) => {
  const { candidate, student_id } = req.body;
  const validCandidates = ["Sabreena", "Azaz"]; // restrict to these

  if (!candidate || !student_id)
    return res.status(400).json({ error: "Candidate and student_id required" });

  if (!validCandidates.includes(candidate))
    return res.status(400).json({ error: "Invalid candidate" });

  try {
    const [check] = await db.query("SELECT * FROM votes WHERE student_id = ?", [student_id]);
    if (check.length > 0) return res.status(400).json({ error: "You already voted" });

    await db.query("INSERT INTO votes (candidate, student_id) VALUES (?, ?)", [candidate, student_id]);
    res.json({ message: `✅ Vote recorded for ${candidate}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ===========================
   REMOVE VOTE
=========================== */
app.post("/removeVote", async (req, res) => {
  const { student_id } = req.body;
  if (!student_id) return res.status(400).json({ error: "student_id required" });

  try {
    const [result] = await db.query("DELETE FROM votes WHERE student_id = ?", [student_id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "No vote to remove" });

    res.json({ message: "✅ Your vote has been removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ===========================
   ADMIN RESULTS
=========================== */
app.post("/results", async (req, res) => {
  const { password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD)
    return res.status(403).json({ error: "Unauthorized access" });

  try {
    const [rows] = await db.query(
      "SELECT candidate, COUNT(*) as votes FROM votes GROUP BY candidate"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
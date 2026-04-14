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
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Database Initialization
async function initDB() {
  try {
    const connection = await db.getConnection();
    console.log('📦 Connected to MySQL DB');

    // Create students table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        batch VARCHAR(50) NOT NULL,
        section VARCHAR(10) NOT NULL
      )
    `);

    // Create votes table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS votes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(50) UNIQUE NOT NULL,
        candidate VARCHAR(100) NOT NULL,
        voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Database tables initialized');
    connection.release();
  } catch (err) {
    console.error('❌ DB connection/init error:', err.message);
    if (err.code === 'ER_BAD_DB_ERROR') {
      console.error('Please create the database manually first: ' + process.env.DB_NAME);
    }
    process.exit(1);
  }
}

initDB();

/* ===========================
   STUDENT LOGIN
=========================== */
app.post("/login", async (req, res) => {
  const { name, student_id, section, batch } = req.body;

  if (!name || !student_id || !section || !batch)
    return res.status(400).json({ error: "All fields required" });

  if (section.toUpperCase() !== "L")
    return res.status(403).json({ error: "Only Section L allowed for this simulator" });

  try {
    const [rows] = await db.query("SELECT * FROM students WHERE student_id = ?", [student_id]);
    
    if (rows.length === 0) {
      // In a real app, we wouldn't auto-register, but for a simulator, maybe?
      // For now, let's stick to the user's logic: Student must exist.
      return res.status(403).json({ error: "Student not registered in the system" });
    }

    const student = rows[0];
    if (student.name.toLowerCase() !== name.toLowerCase() || student.batch !== batch) {
      return res.status(403).json({ error: "Student information mismatch" });
    }

    res.json({ success: true, message: "Welcome, " + student.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ===========================
   VOTE
=========================== */
app.post("/vote", async (req, res) => {
  const { candidate, student_id } = req.body;
  const validCandidates = ["Sabreena", "Azaz"];

  if (!candidate || !student_id)
    return res.status(400).json({ error: "Candidate and Student ID required" });

  if (!validCandidates.includes(candidate))
    return res.status(400).json({ error: "Invalid candidate selection" });

  try {
    // Check if already voted
    const [check] = await db.query("SELECT * FROM votes WHERE student_id = ?", [student_id]);
    if (check.length > 0) return res.status(400).json({ error: "You have already cast your vote" });

    await db.query("INSERT INTO votes (candidate, student_id) VALUES (?, ?)", [candidate, student_id]);
    res.json({ success: true, message: `✅ Your vote for ${candidate} has been recorded!` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to record vote" });
  }
});

/* ===========================
   REMOVE VOTE
=========================== */
app.post("/removeVote", async (req, res) => {
  const { student_id } = req.body;
  if (!student_id) return res.status(400).json({ error: "Student ID required" });

  try {
    const [result] = await db.query("DELETE FROM votes WHERE student_id = ?", [student_id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "No vote found for this ID" });

    res.json({ success: true, message: "✅ Your vote has been successfully removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove vote" });
  }
});

/* ===========================
   ADMIN RESULTS
=========================== */
app.post("/results", async (req, res) => {
  const { password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD)
    return res.status(403).json({ error: "Unauthorized access: Incorrect admin password" });

  try {
    const [rows] = await db.query(
      "SELECT candidate, COUNT(*) as votes FROM votes GROUP BY candidate"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch results" });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
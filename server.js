require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

/* ======================
   Authentication Middleware
====================== */
function isAuthenticated(req, res, next) {
  if (!req.session.student) {
    return res.status(401).json({ error: "Login required" });
  }
  next();
}

/* ======================
   Login Route
====================== */
app.post('/login', (req, res) => {
  const { name, student_id, section, batch } = req.body;

  if (!name || !student_id || !section || !batch) {
    return res.status(400).json({ error: "All fields required" });
  }

  if (section !== 'L') {
    return res.status(403).json({ error: "Only Section L allowed" });
  }

  const idPattern = /^232-35-\d{3}$/;
  if (!idPattern.test(student_id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  db.query(
    "SELECT * FROM students WHERE student_id = ? AND name = ? AND section = ? AND batch = ?",
    [student_id, name, section, batch],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Server error" });

      if (rows.length === 0) {
        return res.status(403).json({ error: "Student not found" });
      }

      req.session.student = rows[0];

      res.json({ success: true, message: "Login successful" });
    }
  );
});

/* ======================
   Vote Route (Protected)
====================== */
app.post('/vote', isAuthenticated, (req, res) => {
  const { candidate } = req.body;
  const student = req.session.student;

  db.query(
    "SELECT has_voted FROM students WHERE student_id = ?",
    [student.student_id],
    (err, rows) => {
      if (rows[0].has_voted) {
        return res.status(400).json({ error: "You already voted" });
      }

      db.query(
        "UPDATE votes SET vote_count = vote_count + 1 WHERE candidate = ?",
        [candidate],
        (err, result) => {
          if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Candidate not found" });
          }

          db.query(
            "UPDATE students SET has_voted = TRUE WHERE student_id = ?",
            [student.student_id]
          );

          res.json({ success: true, message: "Vote recorded" });
        }
      );
    }
  );
});

/* ======================
   Results
====================== */
app.get('/results', isAuthenticated, (req, res) => {
  db.query("SELECT * FROM votes", (err, rows) => {
    if (err) return res.status(500).json({ error: "Error fetching results" });
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
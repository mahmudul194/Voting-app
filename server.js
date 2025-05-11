require('dotenv').config(); // Load environment variables from the .env file
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path'); // To resolve file paths for static files
const app = express();
const PORT = process.env.PORT || 3000; // Use the port from environment variable or fallback to 3000

// CORS configuration
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Serve static files from the "public" folder (for frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Database connection pool using environment variables for sensitive data
const db = mysql.createPool({
  host: 'localhost',
  user: process.env.DB_USER,         // Username from .env
  password: process.env.DB_PASSWORD, // Password from .env
  database: process.env.DB_NAME      // Database name from .env
});

// Check DB connection when the server starts
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1); // Exit the server if DB connection fails
  }
  console.log('Connected to the MySQL database');
  connection.release(); // Release the connection after checking
});

// Vote API
app.post('/vote', (req, res) => {
  const { candidate } = req.body;
  if (!candidate) {
    return res.status(400).send("❌ Candidate name is required.");
  }

  db.query(
    "UPDATE votes SET vote_count = vote_count + 1 WHERE candidate = ?",
    [candidate],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send("❌ Error recording vote.");
      }
      if (result.affectedRows === 0) {
        return res.status(404).send("❌ Candidate not found.");
      }
      res.send("✅ Vote recorded for " + candidate);
    }
  );
});

// Remove Vote API
app.post('/removeVote', (req, res) => {
  const { candidate } = req.body;
  if (!candidate) {
    return res.status(400).send("❌ Candidate name is required.");
  }

  db.query(
    "UPDATE votes SET vote_count = vote_count - 1 WHERE candidate = ? AND vote_count > 0",
    [candidate],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send("❌ Error removing vote.");
      }
      if (result.affectedRows === 0) {
        return res.status(404).send("❌ Candidate not found or no vote to remove.");
      }
      res.send("✅ Vote removed for " + candidate);
    }
  );
});

// Results API
app.get('/results', (req, res) => {
  db.query("SELECT * FROM votes", (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("❌ Error fetching results.");
    }
    res.json(rows);
  });
});

// Serve static frontend (HTML, CSS, JS) on the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

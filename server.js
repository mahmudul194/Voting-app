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
  host: 'localhost',
  user: process.env.DB_USER,         
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME      
});

// Check DB connection when the server starts
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1); 
  }
  console.log('Connected to the MySQL database');
  connection.release(); 
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


app.get('/results', (req, res) => {
  db.query("SELECT * FROM votes", (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("❌ Error fetching results.");
    }
    res.json(rows);
  });
});


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

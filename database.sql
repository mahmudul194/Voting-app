-- SQL Schema for Voting App

-- Create the database
CREATE DATABASE IF NOT EXISTS voting_app;
USE voting_app;

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    batch VARCHAR(50) NOT NULL,
    section VARCHAR(10) NOT NULL
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    candidate VARCHAR(100) NOT NULL,
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Sample Data (Optional)
-- INSERT INTO students (student_id, name, batch, section) VALUES ('232-35-001', 'Test User', 'Batch 60', 'L');

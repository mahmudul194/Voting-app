# 🗳 Premium Voting Simulator

A full-stack voting application built with Node.js, Express, and MySQL, featuring a premium glassmorphic UI.

## ✨ Features
- **Premium UI**: Glassmorphic design with dark mode, smooth animations, and responsive layout.
- **Student Authentication**: Simple login system for students (simulated).
- **Secure Voting**: Prevents double-voting and unauthorized access to results.
- **Admin Dashboard**: Password-protected live results with progress visualization.
- **Dynamic Database**: Automatically initializes tables on startup.

## 🚀 Getting Started

### Prerequisites
- Node.js installed.
- MySQL server running.

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your environment in `.env`:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=voting_app
   PORT=3000
   ADMIN_PASSWORD=0188
   ```
4. Create the database in MySQL:
   ```sql
   CREATE DATABASE voting_app;
   ```

### Running the App
```bash
npm start
```
The app will be available at `http://localhost:3000`.

## 🛠 Tech Stack
- **Backend**: Express.js, MySQL2
- **Frontend**: Vanilla JS, CSS3 (Glassmorphism), HTML5
- **Icons**: Custom SVGs

## 👤 Author
- **Md.Mahmudul Hoque Rifat**

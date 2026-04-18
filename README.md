# 🗳️ Voting Simulator — Premium Student Election System

A **full-stack, secure, and visually premium voting platform** designed for student elections. Built with a focus on **data integrity, transparency, and modern UI/UX**, this application ensures a reliable and engaging voting experience.

---

## 🚀 Overview

The **Voting Simulator** is a controlled election system tailored for specific student groups (e.g., Batch 41, Section L). It combines **strict backend validation** with a **high-end frontend experience**, ensuring:

* ✔️ One student = One vote
* ✔️ Transparent vote tracking
* ✔️ Real-time election insights
* ✔️ Secure admin auditing

---

## ✨ Core Features

### 🔐 Secure Voter Verification

* Targeted eligibility for specific student groups
* Auto-registration on first successful verification
* Prevents duplicate registrations using the same ID

### 🗳️ Interactive Voting System

* Clean and intuitive candidate selection UI
* Real-time visual feedback on vote selection
* Strict one-vote-per-student enforcement

### 🔄 Vote Management

* Withdraw vote functionality
* Allows users to change their decision and re-cast votes

### 🛡️ Advanced Admin Audit Panel

* Password-protected admin access
* Live results dashboard (bar charts & percentages)
* Full audit trail including:

  * Student Name
  * Student ID
  * Selected Candidate

### 🎨 Premium UI/UX Design

* Glassmorphism design system
* Smooth animations and transitions
* Toast notification system
* Fully responsive across all devices

---

## 🧱 Tech Stack

### 🎨 Frontend

* HTML5, CSS3, JavaScript (ES6+)

### ⚙️ Backend

* Node.js, Express.js, mysql2

### 🗄️ Database

* MySQL (TiDB Cloud)

---

## 📂 Project Structure

```text
Voting-app/
│
├── public/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── assets/
│
├── routes/
│   └── voteRoutes.js
│
├── controllers/
│   └── voteController.js
│
├── db.js
├── server.js
│
├── .env
├── package.json
└── README.md
```

---

## ⚙️ Setup & Installation

### Clone Repo

```bash
git clone https://github.com/mahmudul194/Voting-app.git
cd Voting-app
```

### Install

```bash
npm install
```

### Run

```bash
npm start
```

---

## 🔐 Security Highlights

* One vote per student
* Duplicate prevention
* Secure admin authentication
* Encrypted DB connection

---

## 📄 License

MIT License

---

## 👨‍💻 Author

Mahmudul Hoque Rifat
GitHub: https://github.com/mahmudul194

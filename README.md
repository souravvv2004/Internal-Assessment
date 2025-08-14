# 📚 Internal Assessment Management System (MERN Stack)

## 📖 Overview
The **Internal Assessment Management System** is a full-stack web application built using the **MERN stack** (MongoDB, Express.js, React.js, Node.js).  
It enables faculty to manage students' internal assessment marks and feedback, while students can securely view their results, track progress, and download reports.

---

## 🎯 Objectives
- Provide a digital platform for managing internal assessment records.
- Enable secure, role-based access for faculty and students.
- Offer performance analytics through charts and downloadable reports.
- Improve transparency and accessibility of assessment results.

---

## 🛠️ Tech Stack
- **Frontend:** React.js, TailwindCSS / Bootstrap, Chart.js / Recharts
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens), bcrypt
- **Other Tools:** Axios, Mongoose, PDFKit / jsPDF

---

## 📂 Project Structure
project/
│
├── backend/ # Node.js + Express API
│ ├── models/ # Mongoose schemas
│ ├── routes/ # API endpoints
│ ├── controllers/ # Business logic
│ ├── config/ # DB and JWT config
│ └── server.js # App entry point
│
├── frontend/ # React.js app
│ ├── src/components/ # Reusable UI components
│ ├── src/pages/ # Page views
│ ├── src/context/ # Auth & global state
│ └── src/App.js # Main app file
│
└── README.md



---

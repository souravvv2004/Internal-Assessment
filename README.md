# Internal Assessment System

A web-based internal assessment management system built with Node.js, Express, MongoDB and EJS. The system supports three roles — University Admin, Teacher and Student — each with their own dashboard and features.

---

## Features

### University Admin
- Create teacher and student accounts
- Auto-generate unique IDs (TCH001, SUD001 etc.)
- Send welcome emails with credentials via Nodemailer
- Create and allot courses to teachers and students
- View course dashboards with enrolled students, faculty and assignments

### Teacher
- View alloted courses and assignments
- Create assignments with file attachments
- View submission status — who submitted and who didn't
- Grade student submissions
- Send email reminders to students who haven't submitted

### Student
- View enrolled courses and pending assignments
- Submit assignments with file upload
- View grading status of submitted assignments
- Track submission history

### Authentication
- Role based login — Teacher, Student, Admin
- Passwords hashed using SHA-256
- Sessions managed via encrypted JWT (JWE AES-256-GCM) stored in httpOnly cookies
- Forgot password flow with time-limited email reset links

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Templating | EJS |
| Authentication | JWT (jose - JWE encrypted) |
| File Uploads | Multer |
| Email | Nodemailer + Gmail SMTP |
| Styling | Bootstrap 5 |

---

## Project Structure

```
CSC-503/
├── Models/
│   ├── userModel.js        # Teacher, Student, Admin schemas
│   ├── courseModel.js      # Course and CourseAllot schemas
│   └── assignment.js       # Assignment and Submission schemas
├── Router/
│   ├── login.js            # Login, Teacher dashboard, Student dashboard
│   ├── univ.js             # Admin routes — create users, courses, allotments
│   ├── assignment.js       # Assignment view, submission handling, grading
│   ├── submission.js       # Submission detail view and grading
│   ├── course.js           # Course dashboard
│   ├── password-reset.js   # Forgot password and reset flow
│   └── send-reminder.js    # Email reminder to students
├── views/                  # EJS templates
├── uploads/                # Uploaded assignment files
├── utils/
│   └── jwt.js              # JWE encrypt/decrypt helpers
├── populate.js             # Script to seed student data from JSON
├── index.js                # App entry point
└── .env                    # Environment variables
```

---

## Installation

**1. Clone the repository:**
```bash
git clone https://github.com/your-username/internal-assessment-system.git
cd internal-assessment-system
```

**2. Install dependencies:**
```bash
npm install
```

**3. Create a `.env` file in the root directory:**
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_32_character_minimum_secret_key
Email=your_gmail_address
PASSKEY=your_gmail_app_password
```

> **Note:** For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833) not your regular password.

**4. Start the server:**
```bash
node index.js
```

**5. Open in browser:**
```
http://localhost:3000
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Port to run the server on (default: 8080) |
| `MONGODB_URI` | MongoDB connection string including database name |
| `JWT_SECRET` | Secret key for JWT encryption — minimum 32 characters |
| `Email` | Gmail address used for sending emails |
| `PASSKEY` | Gmail App Password for SMTP authentication |

---

## API Routes

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Landing page |
| GET | `/login` | Login page |
| POST | `/login` | Handle login for all roles |
| GET | `/forgot` | Forgot password page |
| POST | `/forgot` | Send password reset email |
| POST | `/forgot/reset` | Set new password |

### University Admin
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/univ` | Admin dashboard |
| GET | `/univ/createUser` | Create user form |
| POST | `/univ/createUser` | Create teacher or student |
| GET | `/univ/courses` | View all courses |
| POST | `/univ/courses` | Create new course |
| GET | `/univ/courseAllot` | Course allotment form |
| POST | `/univ/courseAllot` | Allot courses to users |

### Teacher
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/login/teachers` | Teacher dashboard |
| POST | `/login/course/create` | Create new assignment |
| GET | `/assignment/:assignmentID` | View assignment + submissions |
| POST | `/send-reminder` | Send reminder email to student |

### Student
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/login/student` | Student dashboard |
| GET | `/assignment/:assignmentID` | View assignment |
| POST | `/assignment/:assignmentID` | Submit assignment |
| GET | `/submission/:submissionID` | View submission detail |

---

## Security Features

- Passwords stored as SHA-256 hashes
- JWT tokens encrypted using the `jose` library — payload is unreadable even at jwt.io
- Cookies set with `httpOnly` and `secure` flags to prevent XSS
- Token expiry set to 24 hours
- Password reset links expire after 5 minutes
- Route level authorization — users can only access their own courses and assignments
- Environment variables used for all secrets — no hardcoded credentials

---


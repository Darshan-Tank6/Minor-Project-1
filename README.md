<!-- `npm install` <br>
`node server.js` <br>
`http://localhost:3000/` <br>

`View profile student:` http://localhost:3000/student/view-profile <br>
`student college details form:` http://localhost:3000/student/student-form <br>

`view teacher class:` http://localhost:3000/teacher/view/classes <br>

`Auth login:` https://localhost:3000/auth/login <br>
`Auth register:` https://localhost:3000/auth/register <br>

`Add colleges admin:` https://localhost:3000/admin/dashboard <br>
`view colleges admin:` http://localhost:3000/admin/colleges <br>

`view department under a college:` http://localhost:3000/admin/college/6891f9c0b570a5fe9498b879/departments <br>
                               : http://localhost:3000/admin/college/:id/departments <br>

`view class under a department:` http://localhost:3000/admin/department/6891f9c8b570a5fe9498b886/classes <br>
                             : http://localhost:3000/admin/department/:id/classes <br>

`view subject under a class:` http://localhost:3000/admin/subjects/under/class/6891f9e6b570a5fe9498b89a <br>
                          : http://localhost:3000/admin/subjects/under/class/:id <br>

`add department:` http://localhost:3000/admin/department/create/6891f9c0b570a5fe9498b879 <br>

`add class under department:` http://localhost:3000/admin/class/create/6891f9c8b570a5fe9498b886 <br>

`add teacher under department:` http://localhost:3000/admin/teacher/create/6891f9c8b570a5fe9498b886 <br>

`add subject under a class:` http://localhost:3000/admin/class/6891f9e6b570a5fe9498b89a/subject/create <br>

add chapter under a subject: http://localhost:3000/admin/subjects/6891fabeb570a5fe9498b8fe <br>
 -->

# 🏥 Medical Leave Management System (Automated with Google Calendar)

![Node.js](https://img.shields.io/badge/Node.js-v18+-green?logo=node.js)
![Express.js](https://img.shields.io/badge/Express.js-Framework-blue?logo=express)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen?logo=mongodb)
![Google Calendar API](https://img.shields.io/badge/Integration-Google%20Calendar-red?logo=googlecalendar)
![Google Auth](https://img.shields.io/badge/Auth-Google%20OAuth2-yellow?logo=google)
![Status](https://img.shields.io/badge/Status-Active-success)

---

## 📋 Overview

The **Medical Leave Management System** is a web-based application that simplifies the process of requesting, approving, and tracking **medical leaves** in educational or corporate environments.  
It integrates **Google Calendar** automation to automatically schedule, update, and cancel approved leaves in the user’s calendar — reducing manual coordination and ensuring better leave transparency.

This project is built using **Node.js**, **Express.js**, **MongoDB**, **Google OAuth**, and **Google Calendar API**, with mailing functionality to keep users and administrators informed in real time.

---

## ✨ Features

| Category                   | Description                                                   |
| -------------------------- | ------------------------------------------------------------- |
| 👤 **User Management**     | Secure Google Authentication (OAuth 2.0)                      |
| 🩺 **Leave Requests**      | Apply for medical leave with details and medical proof        |
| 🗓️ **Automation**          | Auto-creates Google Calendar events for approved leaves       |
| 📧 **Mailer Integration**  | Sends real-time notifications for approvals/rejections        |
| 🔐 **Roles & Permissions** | Separate dashboards for users (students/employees) and admins |
| 📊 **Leave Tracking**      | View leave history and current application status             |
| 🏫 **Admin Controls**      | Admin can approve, reject, or delete leave requests           |
| 🕒 **Logs & Timestamps**   | Maintain detailed logs of leave activity                      |
| ⚙️ **Error Handling**      | Graceful error management and validations                     |

---

## 🧠 Tech Stack

**Backend:** Node.js, Express.js  
**Frontend:** EJS Templates  
**Database:** MongoDB (Mongoose ODM)  
**Authentication:** Google OAuth 2.0  
**Automation:** Google Calendar API  
**Emailing:** Nodemailer (Mailer Integration)  
**Other:** dotenv, express-session, middleware-based access control

---

## 🏗️ Project Structure

```
Minor-Project-1/
├── config/                # Configuration files (DB, API keys, etc.)
├── middleware/            # Auth & access control middleware
├── models/                # Mongoose models (User, Leave, etc.)
├── public/                # Static assets (CSS, JS, images)
├── routes/                # Express routes for users, admin, and auth
├── utils/                 # Utility functions (mailer, Google API, etc.)
├── views/                 # EJS templates for frontend pages
├── server.js              # Entry point of the app
├── keygen.js              # Helper script (e.g., API key generation)
├── package.json           # Project dependencies and scripts
└── README.md              # Project documentation
```

---

## ⚙️ Installation & Setup

Follow these steps to set up the project locally:

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Darshan-Tank6/Minor-Project-1.git
cd Minor-Project-1
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Setup Environment Variables

Create a `.env` file in the project root with the following structure:

```env
PORT=3000
MONGO_URI=mongodb+srv://<your-db-uri>
SESSION_SECRET=<your-secret>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_REFRESH_TOKEN=<your-refresh-token>
GOOGLE_CALENDAR_ID=<your-calendar-id>
MAIL_USER=<your-email>
MAIL_PASS=<your-email-password>
```

> ⚠️ _Make sure you have enabled Google Calendar API and Google OAuth 2.0 credentials in your Google Cloud Console._

### 4️⃣ Start the Server

```bash
node server.js
```

The application will be available at:  
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🧭 Usage Guide

### 🔹 Login

- Visit `/auth/login`
- Sign in using your Google account

### 🔹 Apply for Medical Leave

- Navigate to **“Apply Leave”**
- Fill in required details and attach medical proof (if required)
- Submit the request

### 🔹 Admin Review

- Admin can view all leave requests
- Approve or reject requests
- On approval, event automatically added to employee’s Google Calendar
- Notifications sent to both user and admin

---

## 🧩 Key Integrations

### 🗓️ Google Calendar Automation

Automatically creates calendar events for approved leaves:

- Start/end date set according to leave duration
- Description includes applicant details and reason
- Auto-deletion on leave cancellation

### 📧 Email Notifications

Using **Nodemailer**, automatic emails are sent for:

- Leave submission confirmation
- Admin approval/rejection
- Calendar updates

---

## 🔐 Authentication Flow

1. User logs in via Google OAuth
2. Application verifies credentials with Google Auth API
3. Session created via `express-session`
4. User’s role (student/admin) determines accessible routes
5. Auth middleware protects restricted areas

---

## 🧱 API Endpoints (Sample)

| Method | Endpoint             | Description             | Access        |
| ------ | -------------------- | ----------------------- | ------------- |
| `GET`  | `/auth/login`        | Google OAuth login      | Public        |
| `GET`  | `/dashboard`         | View dashboard          | Authenticated |
| `POST` | `/leave/apply`       | Submit leave request    | User          |
| `GET`  | `/leave/view`        | View all leave requests | User          |
| `PUT`  | `/leave/approve/:id` | Approve leave           | Admin         |
| `PUT`  | `/leave/reject/:id`  | Reject leave            | Admin         |

---

## 🧰 Utilities & Middleware

| Folder        | Purpose                                               |
| ------------- | ----------------------------------------------------- |
| `middleware/` | Auth checks, role verification                        |
| `utils/`      | Email service, calendar integration, helper functions |
| `models/`     | Mongoose schemas for user, leave, etc.                |
| `routes/`     | Organized route handlers for auth, admin, users       |

---

## 🧑‍💻 Future Improvements

- 📱 Add responsive React frontend
- 🔔 Push notifications for approvals
- 📈 Analytics dashboard for admin
- 🕵️ Audit log for all leave activities
- 🧾 Export leave reports (PDF/Excel)

---

## 🖼️ Screenshots (Add yours here)

| Login Page                           | Dashboard                                    | Leave Form                               |
| ------------------------------------ | -------------------------------------------- | ---------------------------------------- |
| ![Login](docs/screenshots/login.png) | ![Dashboard](docs/screenshots/dashboard.png) | ![Form](docs/screenshots/leave_form.png) |

> _(You can replace these image paths once you add screenshots to the `docs/screenshots/` folder.)_

---

## 🤝 Contributing

Contributions are welcome!  
To contribute:

1. Fork the repository
2. Create your feature branch
   ```bash
   git checkout -b feature/my-new-feature
   ```
3. Commit changes
   ```bash
   git commit -m "Add new feature"
   ```
4. Push to the branch and open a Pull Request

---

## 📬 Contact

**Author:** [Darshan Tank](https://github.com/Darshan-Tank6)  
**Project Repository:** [Minor Project 1](https://github.com/Darshan-Tank6/Minor-Project-1)

For questions or feedback, feel free to open an issue on GitHub.

---

> 🧾 **Note:** This project is for educational / academic purposes.  
> Future releases may include enhanced APIs, calendar syncing, and real-time dashboards.

---

⭐ _If you like this project, don’t forget to star the repo!_

# InternHub – Responsive Internship Board

A LinkedIn-inspired, responsive internship discovery platform developed as part of the **EdVyro Full Stack Development Internship – Task 04: Secure Application Integration**.

InternHub allows students to explore internship opportunities, search and filter listings, save interesting internships, and submit applications through an interactive application form.

The project integrates a frontend built with HTML, CSS, and JavaScript with a backend REST API developed using Node.js, Express.js, and SQLite.

---

## Project Overview

**Project Name:** InternHub – Responsive Internship Board

**Internship:** EdVyro Full Stack Development Internship

**Task:** Task 04 – Secure Application Integration

**Project Type:** Full Stack Web Application

### Technologies Used

| Frontend | Backend | Database | Tools |
|---|---|---|---|
| HTML5 | Node.js | SQLite | VS Code |
| CSS3 | Express.js | better-sqlite3 | Git |
| JavaScript | REST API | | GitHub |
| Fetch API | Helmet | | Postman |

---

## Features

### Frontend Features

- Responsive, LinkedIn-inspired internship discovery interface.
- Three-column desktop layout.
- Search internships by title, domain, location, mode, ID, or skills.
- Filter internships by domain and work mode.
- Quick domain selection chips.
- Dynamically display internship listings from the backend API.
- Save and bookmark internships using browser localStorage.
- View detailed internship information.
- Interactive internship application form.
- Submit applicant information to the backend.
- Display application submission status and reference ID.
- Form validation and error handling.
- Responsive design for desktop, tablet, and mobile devices.
- Semantic HTML and accessible form controls.

### Backend Features

- RESTful API using Node.js and Express.js.
- Retrieve internship listings.
- Retrieve individual internship details.
- Create, update, and delete internship records.
- Submit internship applications.
- Store application information in SQLite.
- Server-side input validation.
- Structured JSON responses.
- Centralized error handling.
- Health-check endpoint.

### Security Features

- **Helmet:** Adds HTTP security headers.
- **CORS:** Restricts permitted frontend origins.
- **Rate Limiting:** Limits API requests to 100 requests per 15-minute window.
- **Input Validation:** Validates applicant information before database operations.
- **Parameterized SQL Queries:** Helps prevent SQL injection.
- **Request Size Limiting:** Restricts JSON request bodies to 100 KB.
- **URL Validation:** Accepts only HTTP and HTTPS resume URLs.

---

## System Architecture

The application follows a frontend-backend architecture.

```text
          USER
           |
           v
   FRONTEND APPLICATION
      HTML / CSS / JS
           |
           | Fetch API
           v
      EXPRESS SERVER
           |
           v
     SECURITY LAYER
    -----------------
    Helmet
    CORS
    Rate Limiting
    Input Validation
    -----------------
           |
           v
       REST API
           |
           v
     SQLITE DATABASE
    -----------------
       Internships
       Applications
    -----------------
```

### Application Workflow

1. The user opens the InternHub website.
2. The frontend requests internship listings from the backend API.
3. The backend retrieves internship records from SQLite.
4. Internship information is displayed dynamically.
5. The user selects an internship and clicks **Apply Now**.
6. The application form collects applicant details.
7. The frontend sends the application to the backend.
8. The backend validates the submitted information.
9. Valid application details are stored in the SQLite database.
10. The frontend displays a success message with an application reference ID.

---

## Project Repositories

### Frontend Repository

GitHub: https://github.com/Balamaheshchandar/responsive-internship-board

### Backend Repository

GitHub: https://github.com/Balamaheshchandar/internship-management-api

---

## Project Structure

### Frontend

```text
responsive-internship-board/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

### Backend

```text
internship-management-api/
│
├── src/
│   ├── app.js
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── internships.js
│   │   └── applications.js
│   ├── middleware/
│   │   └── errors.js
│   └── routes/
│       ├── internships.js
│       └── applications.js
│
├── data/
│   └── internships.db
│
├── package.json
└── package-lock.json
```

---

## Backend API Documentation

**Base URL:**

```text
http://localhost:3000
```

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Check API status |

Example response:

```json
{
  "success": true,
  "status": "ok"
}
```

### Internship Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/internships` | Retrieve all internships |
| GET | `/api/internships/:id` | Retrieve an internship by ID |
| POST | `/api/internships` | Create a new internship |
| PUT | `/api/internships/:id` | Update an internship |
| DELETE | `/api/internships/:id` | Delete an internship |

### Application Endpoint

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/applications` | Submit an internship application |

Example request:

```json
{
  "internship_id": 1,
  "applicant_name": "Test Student",
  "email": "student@example.com",
  "phone": "9876543210",
  "resume_url": "https://example.com/resume.pdf",
  "cover_letter": "I am interested in this internship."
}
```

Example successful response:

```json
{
  "success": true,
  "message": "Application submitted successfully",
  "application_id": 1
}
```

---

## Installation and Setup

### Prerequisites

Install the following tools:

- Node.js
- npm
- Visual Studio Code
- Git
- VS Code Live Server extension

### Step 1: Clone the Backend Repository

```bash
git clone https://github.com/Balamaheshchandar/internship-management-api.git
```

Open the backend folder:

```bash
cd internship-management-api
```

### Step 2: Install Backend Dependencies

```bash
npm install
```

### Step 3: Start the Backend Server

Run the start command configured in the backend `package.json`.

The backend API should be available at:

```text
http://localhost:3000
```

Check the API health:

```text
http://localhost:3000/health
```

### Step 4: Clone the Frontend Repository

Open another terminal:

```bash
git clone https://github.com/Balamaheshchandar/responsive-internship-board.git
```

Open the frontend folder in VS Code.

### Step 5: Run the Frontend

1. Open `index.html` in VS Code.
2. Right-click the file.
3. Select **Open with Live Server**.

The frontend is available at:

```text
http://127.0.0.1:5500/responsive-internship-board/index.html
```

**Important:** Start the backend before using the frontend. The frontend currently communicates with the local backend at `http://localhost:3000`.

---

## Database

The application uses SQLite with the `better-sqlite3` package.

The database stores:

- Internship records.
- Applicant information.
- Internship application details.
- Application submission timestamps.

### Applications Table

| Column | Description |
|---|---|
| id | Unique application ID |
| internship_id | Related internship ID |
| applicant_name | Applicant's full name |
| email | Applicant's email |
| phone | Applicant's phone number |
| resume_url | Resume link |
| cover_letter | Applicant's cover letter |
| created_at | Application submission time |

The application table uses a foreign key to associate applications with internships.

---

## Testing and Validation

The following checks were performed during development.

| Test | Expected Result |
|---|---|
| Backend health check | HTTP 200 |
| Retrieve internships | Internship records returned |
| Submit valid application | HTTP 201 |
| Invalid applicant details | HTTP 400 |
| Invalid internship ID | HTTP 400 |
| SQL injection-style internship ID | Rejected |
| Rate limit exceeded | HTTP 429 |
| Frontend application submission | Success message displayed |
| Application database storage | Application record created |
| Security headers | Helmet headers returned |

### Manual Frontend Testing

- Search for internships.
- Apply domain and work-mode filters.
- Save and unsave internship listings.
- Open the application form.
- Submit valid applicant details.
- Test invalid email and phone values.
- Check the application success message.
- Verify responsive layout on different screen sizes.

---

## Security Implementation

The backend includes several security measures to improve application safety.

**Helmet**

Adds security-related HTTP response headers.

**CORS**

Allows requests from the configured frontend development origin.

**Rate Limiting**

Restricts API requests to 100 requests per 15 minutes.

**Input Validation**

Validates applicant name, email, phone number, internship ID, resume URL, and cover letter.

**SQL Injection Protection**

Uses parameterized database queries instead of directly inserting user input into SQL statements.

**Request Size Limiting**

Restricts incoming JSON request bodies to 100 KB.

---

## Future Enhancements

- User registration and authentication.
- Admin dashboard for managing internships.
- Applicant dashboard.
- Application status tracking.
- Resume file upload.
- Email notifications.
- Cloud database integration.
- Backend deployment and frontend hosting.
- Role-based access control.

---

## Data and Project Disclaimer

The internship records are fictional demonstration records created for educational purposes.

Applications submitted through the application form are stored in the local SQLite database.

The current application is configured for local development and is not yet a publicly deployed production service.

This project is an independent educational project and is not affiliated with LinkedIn.

---

## Author

**Balaperumal A**

Full Stack Development Intern

**GitHub:** https://github.com/Balamaheshchandar

---

## Acknowledgement

Developed as part of the **EdVyro Full Stack Development Internship – Task 04: Secure Application Integration**.

Thank you to EdVyro for providing this opportunity to learn and implement full-stack application development and security concepts.

---

**Project Status:** Task 04 – Implementation and GitHub submission completed.
# Job Board API

A RESTful backend API for a fullstack job board platform built with Node.js, Express, and MongoDB. Allows companies to post jobs, candidates to apply, and admins to manage the platform.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | Web framework |
| MongoDB Atlas | Cloud database |
| Mongoose | MongoDB object modeling |
| bcryptjs | Password hashing |
| jsonwebtoken | Authentication tokens |
| cookie-parser | Reading cookies from requests |
| cors | Cross-origin resource sharing |
| dotenv | Environment variable management |
| nodemon | Auto-restart during development |

---

## Project Structure

```
job-board-backend/
├── src/ (or backend/)
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js   # signup, signin
│   │   ├── job.controller.js    # CRUD for jobs
│   │   ├── company.controller.js # company management
│   │   └── application.controller.js # job applications
│   ├── middleware/
│   │   ├── auth.middleware.js   # protectRoute, adminRoute
│   │   ├── role.middleware.js   # authorise, adminOnly, companyOnly, candidateOnly
│   │   └── job.middleware.js    # jobExists, jobOwner, jobIsOpen
│   ├── models/
│   │   ├── user.model.js
│   │   ├── company.model.js
│   │   ├── job.model.js
│   │   └── application.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── job.routes.js
│   │   ├── company.routes.js
│   │   └── application.routes.js
│   ├── app.js                   # Express setup, middleware, routes
│   └── index.js                 # Entry point — connects DB and starts server
├── .env                         # Environment variables (never commit this)
├── .gitignore
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- A MongoDB Atlas account and cluster
- Postman (for testing the API)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/DiyaFarouk/job-board.git
cd job-board/backend
```

**2. Install dependencies**
```bash
npm install
```

**3. Create your `.env` file**

Create a `.env` file in the root of the project and add the following:

```env
PORT=8000
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.mongodb.net/jobboard
JWT_SECRET=your_super_secret_key_here_make_it_long_and_random
NODE_ENV=development
```

> ⚠️ Never commit your `.env` file to GitHub. It is already listed in `.gitignore`.

**4. Start the development server**
```bash
npm run dev
```

You should see:
```
MongoDB connected: cluster0.mongodb.net
Server running on port 8000
```

**5. Test the API is running**

Open your browser or Postman and visit:
```
GET http://localhost:8000/
```
You should get:
```json
{ "message": "Job Board API is running" }
```

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the server runs on | `8000` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `mysecretkey123` |
| `NODE_ENV` | Environment mode | `development` or `production` |

---

## API Routes

### Auth Routes — `/api/auth`

| Method | Route | Description | Access |
|---|---|---|---|
| POST | `/api/auth/signup` | Register a new user | Public |
| POST | `/api/auth/signin` | Login and receive token | Public |

**Signup request body:**
```json
{
  "name": "Farouk",
  "email": "farouk@example.com",
  "password": "password123",
  "role": "candidate"
}
```

> Role must be one of: `candidate`, `company`, `admin`

**Signin request body:**
```json
{
  "email": "farouk@example.com",
  "password": "password123"
}
```

---

### Job Routes — `/api/jobs`

| Method | Route | Description | Access |
|---|---|---|---|
| GET | `/api/jobs` | Get all open jobs | Public |
| GET | `/api/jobs/:id` | Get single job | Public |
| POST | `/api/jobs` | Create new job | Company / Admin |
| PUT | `/api/jobs/:id` | Update a job | Company (owner) |
| DELETE | `/api/jobs/:id` | Delete a job | Company (owner) / Admin |

**Optional query filters for GET /api/jobs:**
```
/api/jobs?category=Tech
/api/jobs?location=Lagos
/api/jobs?type=remote
/api/jobs?search=React
```

**Create job request body:**
```json
{
  "title": "Frontend Developer",
  "description": "We need a React developer with 2+ years experience",
  "location": "Lagos",
  "type": "full-time",
  "category": "Tech",
  "skills": ["React", "JavaScript", "CSS"],
  "salary": { "min": 100000, "max": 200000 },
  "deadline": "2026-12-31"
}
```

---

### Company Routes — `/api/companies`

| Method | Route | Description | Access |
|---|---|---|---|
| GET | `/api/companies` | Get all verified companies | Public |
| GET | `/api/companies/:id` | Get single company | Public |
| GET | `/api/companies/:id/jobs` | Get all jobs by company | Public |
| GET | `/api/companies/me` | Get my company profile | Company |
| POST | `/api/companies` | Create company profile | Company |
| PUT | `/api/companies/:id` | Update company profile | Company (owner) |
| DELETE | `/api/companies/:id` | Delete company | Company (owner) / Admin |
| PATCH | `/api/companies/:id/verify` | Verify a company | Admin |
| GET | `/api/companies/admin/unverified` | Get unverified companies | Admin |

---

### Application Routes — `/api/applications`

| Method | Route | Description | Access |
|---|---|---|---|
| POST | `/api/applications` | Apply to a job | Candidate |
| GET | `/api/applications/me` | Get my applications | Candidate |
| GET | `/api/applications/job/:jobId` | Get all applicants for a job | Company |
| PATCH | `/api/applications/:id` | Accept or reject an application | Company |

**Apply to job request body:**
```json
{
  "jobId": "64abc123def456",
  "coverLetter": "I am a great fit for this role because..."
}
```

**Update application status request body:**
```json
{
  "status": "accepted"
}
```

> Status must be one of: `pending`, `reviewing`, `accepted`, `rejected`

---

## Authentication

This API uses **JWT tokens stored in HTTP-only cookies**.

After signing in, the token is automatically saved as a cookie named `access_token`. It is sent automatically with every subsequent request.

For protected routes, include the token in the `Authorization` header when testing in Postman:
```
Authorization: Bearer your_token_here
```

Or set it as a cookie in Postman:
```
Cookie: access_token=your_token_here
```

---

## User Roles

| Role | What they can do |
|---|---|
| `candidate` | Browse jobs, apply to jobs, manage applications |
| `company` | Create company profile, post jobs, manage applicants |
| `admin` | Manage all users, verify companies, remove listings |

---

## Testing with Postman

**Step 1 — Sign up**
```
POST http://localhost:8000/api/auth/signup
Body: { "name": "Farouk", "email": "farouk@test.com", "password": "pass123", "role": "candidate" }
```

**Step 2 — Sign in and copy the token**
```
POST http://localhost:8000/api/auth/signin
Body: { "email": "farouk@test.com", "password": "pass123" }
```

**Step 3 — Use the token on protected routes**
```
POST http://localhost:8000/api/jobs
Headers: Authorization: Bearer YOUR_TOKEN
Body: { "title": "React Developer", "description": "...", "location": "Lagos" }
```

---

## Error Responses

All error responses follow this format:
```json
{
  "message": "A description of what went wrong",
  "error": "Detailed error message (development only)"
}
```

| Status Code | Meaning |
|---|---|
| `200` | OK — request succeeded |
| `201` | Created — new resource added to database |
| `400` | Bad Request — missing or invalid fields |
| `401` | Unauthorized — not logged in or invalid token |
| `403` | Forbidden — logged in but not allowed |
| `404` | Not Found — resource does not exist |
| `500` | Server Error — something crashed on the server |

---

## Scripts

```bash
npm run dev     # start with nodemon (auto-restarts on changes)
npm start       # start without nodemon (production)
```

---

## Common Issues

**nodemon crashes with "Cannot find module index.js"**
- Remove the `"main": "index.js"` field from `package.json`
- Make sure your dev script is `"nodemon src/index.js"` not `"nodemon src/index.js index.js"`

**MongoDB connection failed**
- Check your `MONGODB_URI` in `.env` is correct
- Go to MongoDB Atlas → Network Access → Add your current IP address
- Make sure your cluster is running

**Unauthorized - No access token provided**
- You are hitting a protected route without a token
- Sign in first and include the token in your request header

---

## Author

**Diyaolu Farouk Temitope**
Graduate Trainee — Frontend Development | Webfield Technologies
- GitHub: [@DiyaFarouk](https://github.com/DiyaFarouk)

---

## License

ISC

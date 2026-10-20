# Jobora — Job Search & Application Tracker

> **"Your next opportunity starts here."**

A complete full-stack job search and personal application tracker web application built as a Web Application Development (WAD) subject project. Demonstrates HTML, CSS, Vanilla JavaScript, jQuery, AJAX, Node.js, Express.js, MongoDB, and Mongoose from end to end.

---

## 📋 Project Overview

**Jobora** lets job seekers — especially students and fresh graduates — browse realistic demo job listings, save opportunities for later, and personally track their application progress all in one place.

### What problem does it solve?
Job seekers often juggle multiple applications across different platforms with no centralised way to keep track. Jobora provides:
- A searchable, filterable job board
- A personal save/bookmark feature
- A personal application tracker with status management
- A profile/preferences section

### Intended Users
- B.Tech / Engineering students looking for internships and entry-level jobs
- Fresh graduates tracking multiple job applications

---

## ✅ Features

| Feature | Status |
|---|---|
| Browse job listings from MongoDB | ✅ |
| Search by title, keyword, company, description | ✅ |
| Filter by type, work mode, experience level | ✅ |
| Sort by newest, title, salary | ✅ |
| Job detail modal with full description | ✅ |
| Save / unsave jobs (persisted in MongoDB) | ✅ |
| Application tracker with status management | ✅ |
| Add, edit, delete application entries | ✅ |
| Job-seeker profile & preferences | ✅ |
| Dashboard summary counts from real DB | ✅ |
| Demo data clearly labelled | ✅ |
| Mobile responsive layout | ✅ |
| Loading, empty, and error states | ✅ |
| Toast notifications | ✅ |

### ⚠️ Limitations
- Single-user demo (no real authentication or multi-user accounts)
- Job listings are seeded demo data (not connected to real job boards)
- "Track Application" only tracks your personal progress — it does NOT submit your application to any employer
- External Apply links work only when a real URL is provided in the data

---

## 🛠️ Technologies Used

| Technology | Why |
|---|---|
| **HTML5** | Page structure and semantic content |
| **CSS3** | Responsive layout and visual design (CSS variables, Flexbox, Grid) |
| **Vanilla JavaScript** | Application logic, DOM manipulation, event handling |
| **jQuery** | Event handling, AJAX requests, DOM selection |
| **Node.js** | Server-side JavaScript runtime |
| **Express.js** | REST API framework, routing, middleware |
| **MongoDB** | NoSQL database for persistent storage |
| **Mongoose** | ODM for MongoDB — schemas, validation, queries |
| **dotenv** | Load environment variables from .env |
| **CORS** | Allow cross-origin requests during development |
| **Nodemon** | Auto-restart server on code changes during development |
| **npm** | Package manager |

---

## 🗂️ Project Structure

```
jobora-job-search/
├── public/                   ← Frontend (served as static files by Express)
│   ├── index.html            ← Single HTML page (SPA shell)
│   ├── css/
│   │   └── style.css         ← All styles (CSS variables, components, responsive)
│   └── js/
│       └── app.js            ← All frontend logic (jQuery AJAX, DOM, events)
├── models/
│   ├── Job.js                ← Job listing Mongoose model
│   ├── SavedJob.js           ← Saved jobs Mongoose model
│   ├── Application.js        ← Application tracker Mongoose model
│   └── Profile.js            ← Job-seeker profile Mongoose model
├── routes/
│   ├── jobRoutes.js          ← GET /api/jobs, GET /api/jobs/:id
│   ├── savedJobRoutes.js     ← GET/POST/DELETE /api/saved-jobs
│   ├── applicationRoutes.js  ← CRUD /api/applications
│   └── profileRoutes.js      ← GET/PUT /api/profile
├── middleware/
│   └── errorHandler.js       ← Centralised error handler
├── config/
│   └── db.js                 ← MongoDB connection using Mongoose
├── scripts/
│   └── seedJobs.js           ← Seeds 15 demo job listings (idempotent)
├── server.js                 ← Express server entry point
├── package.json
├── .env                      ← NOT committed — contains MONGODB_URI and PORT
├── .env.example              ← Safe template — commit this instead of .env
├── .gitignore
└── README.md
```

---

## 🚀 Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or above recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) installed locally, **OR** a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account

---

### Step 1 — Clone or open the project folder

Open a terminal (PowerShell or Command Prompt) in VS Code and `cd` into the project folder:

```powershell
cd "C:\Users\Niranjana S Nair\.gemini\antigravity\scratch\jobora-job-search"
```

---

### Step 2 — Install dependencies

```powershell
npm install
```

This installs Express, Mongoose, dotenv, cors, and nodemon.

---

### Step 3 — Configure environment variables

Copy `.env.example` to `.env`:

```powershell
copy .env.example .env
```

Then edit `.env`:

```
# Local MongoDB (if MongoDB is installed locally):
MONGODB_URI=mongodb://localhost:27017/jobora
PORT=5000
```

---

### Step 4 — Start MongoDB

**Option A — Local MongoDB:**
Make sure MongoDB is running. In a separate terminal:
```powershell
mongod
```
Or if installed as a Windows service, it starts automatically.

**Option B — MongoDB Atlas (cloud):**
1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Click **Connect → Drivers**, copy the connection string
3. Replace the `MONGODB_URI` in `.env`:
```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/jobora?retryWrites=true&w=majority
```
Replace `<username>` and `<password>` with your Atlas credentials.

---

### Step 5 — Seed demo job data

Run the seed script to insert 15 demo job listings into MongoDB:

```powershell
npm run seed
```

You should see output like:
```
✅ Connected to MongoDB
✅ Inserted: Frontend Developer @ TechNova Solutions
✅ Inserted: Backend Developer Intern @ CloudBridge Technologies
...
📋 Seed complete: 15 inserted, 0 skipped.
⚠️  All inserted listings are DEMO data — not real job vacancies.
```

**The seed script is idempotent** — running it again will skip listings that already exist.

---

### Step 6 — Start the development server

```powershell
npm run dev
```

Nodemon will start the server and watch for file changes:
```
🚀 Jobora server running at http://localhost:5000
✅ MongoDB Connected: localhost
```

---

### Step 7 — Open in browser

Navigate to: **[http://localhost:5000](http://localhost:5000)**

---

## 🔌 API Endpoints

All endpoints return JSON in the format:
```json
{ "success": true, "data": { ... } }
```
or on error:
```json
{ "success": false, "message": "Error description" }
```

### Jobs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/jobs` | Get job listings with optional filters |
| `GET` | `/api/jobs/:id` | Get one job by ID |

**Query Parameters for `GET /api/jobs`:**

| Param | Example | Description |
|-------|---------|-------------|
| `search` | `frontend developer` | Search in title, company, description, skills |
| `location` | `Bengaluru` | Filter by location |
| `company` | `TechNova` | Filter by company |
| `type` | `Full-time` | Filter by employment type |
| `workMode` | `Remote` | Filter by work mode |
| `experienceLevel` | `Fresher / Entry-level` | Filter by experience level |
| `sort` | `newest` | Sort: newest, oldest, title_asc, title_desc, salary_asc, salary_desc |

**Example request:**
```
GET /api/jobs?search=developer&workMode=Remote&sort=newest
```

**Example response:**
```json
{
  "success": true,
  "total": 3,
  "page": 1,
  "limit": 20,
  "data": [
    {
      "_id": "6651abc...",
      "title": "Backend Developer Intern",
      "company": "CloudBridge Technologies",
      "location": "Hyderabad, Telangana",
      "workMode": "Remote",
      "employmentType": "Internship",
      "isDemo": true,
      ...
    }
  ]
}
```

---

### Saved Jobs

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `GET` | `/api/saved-jobs` | — | Get all saved jobs |
| `POST` | `/api/saved-jobs` | `{ jobId }` | Save a job |
| `DELETE` | `/api/saved-jobs/:jobId` | — | Unsave a job |

---

### Application Tracker

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `GET` | `/api/applications` | — | Get all tracked applications |
| `GET` | `/api/applications/:id` | — | Get one application |
| `POST` | `/api/applications` | `{ jobId, status, notes }` | Add to tracker |
| `PUT` | `/api/applications/:id` | `{ status, notes, appliedAt }` | Update application |
| `DELETE` | `/api/applications/:id` | — | Delete application |

**Application statuses:** `Interested`, `Preparing to Apply`, `Applied`, `Assessment`, `Interview`, `Offer`, `Rejected`, `Withdrawn`

---

### Profile

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `GET` | `/api/profile` | — | Get profile |
| `PUT` | `/api/profile` | Profile fields | Update profile |

---

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard` | Get real counts from DB |

---

## 🔗 How jQuery AJAX Works in Jobora

The frontend (`app.js`) uses jQuery AJAX methods to communicate with the Express backend:

```javascript
// GET request with query parameters (search + filters)
$.ajax({
  url: '/api/jobs',
  method: 'GET',
  data: { search: 'developer', workMode: 'Remote' },
  success: function(res) {
    // res.data contains the array of job objects
    res.data.forEach(job => renderJobCard(job, '#job-grid'));
  },
  error: function(xhr) {
    showJobsError(xhr.responseJSON?.message || 'Server error');
  }
});

// POST request with JSON body (save a job)
$.ajax({
  url: '/api/saved-jobs',
  method: 'POST',
  contentType: 'application/json',
  data: JSON.stringify({ jobId: '6651abc...' }),
  success: function(res) { showToast('Job saved!', 'success'); }
});

// DELETE request
$.ajax({
  url: '/api/saved-jobs/' + jobId,
  method: 'DELETE',
  success: function(res) { showToast('Job unsaved.', 'info'); }
});
```

---

## 🎨 How DOM Manipulation Works

Job cards, application entries, and the job detail modal are all built dynamically in JavaScript:

```javascript
function renderJobCard(job, gridSelector) {
  const cardHtml = `
    <article class="job-card" data-job-id="${escapeHtml(job._id)}">
      <h3 class="job-card-title">${escapeHtml(job.title)}</h3>
      <p>${escapeHtml(job.company)}</p>
      ...
    </article>
  `;
  $(gridSelector).append(cardHtml);
}
```

`escapeHtml()` prevents XSS by escaping special characters before inserting text into HTML.

---

## 🗃️ How Mongoose Works

**Define a schema:**
```javascript
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true },
  workMode: { type: String, enum: ['On-site', 'Hybrid', 'Remote'] },
  // ...
}, { timestamps: true });
```

**Query the database:**
```javascript
// Find jobs with text search and filters
const jobs = await Job.find({ isActive: true, workMode: 'Remote' })
  .sort({ postedAt: -1 })
  .lean();

// Create a record
await SavedJob.create({ job: jobId, demoUserId: 'demo-user-001' });

// Update a record
await Application.findByIdAndUpdate(id, { status: 'Interview' }, { new: true });

// Delete a record
await Application.findByIdAndDelete(id);
```

---

## 📊 How Search, Filters & Sorting Work

1. User types in the search box or changes a filter dropdown
2. The frontend reads all filter values into `State.currentFilters`
3. jQuery AJAX sends `GET /api/jobs?search=...&workMode=...&sort=...`
4. Express parses query params, builds a safe MongoDB query object
5. Mongoose runs the query and returns matching jobs
6. JavaScript renders the job cards dynamically in the DOM

Multiple filters work together because each active filter is added to the same MongoDB query object — they are combined with a logical AND.

---

## 🔒 How Demo Data Differs from Live Jobs

| | Demo Listings | Live Job Board |
|---|---|---|
| Source | Seeded into MongoDB | Real job API or employer |
| Real vacancy? | ❌ No | ✅ Yes |
| Apply directly? | ❌ No application URL | ✅ Real URL |
| Salary accurate? | Illustrative only | Real offer |
| Labelled in UI? | ✅ "📋 Demo" badge | Varies |

All seed jobs have `isDemo: true` and are labelled with a "📋 Demo" badge in the UI.

---

## 📷 Screenshots

*(Add screenshots here after running the app locally.)*

To add a screenshot:
1. Run the app and open [http://localhost:5000](http://localhost:5000)
2. Take a screenshot
3. Save it to `public/screenshots/`
4. Add it here: `![Discover View](public/screenshots/discover.png)`

---

## 🐛 Common Errors & Troubleshooting

| Error | Likely Cause | Fix |
|---|---|---|
| `MongoServerError: connect ECONNREFUSED` | MongoDB not running | Run `mongod` or use Atlas |
| `Cannot GET /api/jobs` | Server not started | Run `npm run dev` |
| `No jobs found` after seed | Seed not run | Run `npm run seed` |
| `Port 5000 already in use` | Another process on port 5000 | Change `PORT` in `.env` |
| jQuery not loading | No internet (CDN) | Check network; CDN is in index.html |

---

## 🌱 Possible Future Improvements

- Real authentication with JWT or sessions
- Integration with a real job API (e.g., Adzuna, Reed)
- Resume upload and storage (Multer + GridFS)
- Email reminders for application deadlines
- Application analytics and progress charts
- Multi-user support with proper account management

---

## 📚 WAD Syllabus Topics Demonstrated

| Syllabus Topic | Where in Jobora |
|---|---|
| **HTML & CSS** | `public/index.html`, `public/css/style.css` |
| **JavaScript functions & objects** | `public/js/app.js` — State object, utility functions |
| **DOM manipulation** | `renderJobCard()`, `renderJobModal()`, `renderApplicationCard()` |
| **Event handling** | `bindEvents()` — form submit, click, change, keydown |
| **jQuery** | All DOM selection and AJAX calls use jQuery |
| **AJAX** | `$.ajax()` calls in `fetchJobs()`, `toggleSaveJob()`, `addToTracker()`, etc. |
| **Node.js** | `server.js` — runtime for the entire backend |
| **Express.js & REST APIs** | All route files — GET, POST, PUT, DELETE |
| **MongoDB** | Database storing jobs, saved jobs, applications, profile |
| **Mongoose** | All models (schema, validation, queries) |
| **CRUD operations** | Full CRUD on applications, GET/POST/DELETE on saved jobs |
| **Backend validation** | Allowlisted filters, ObjectId checks, enum validation |
| **Error handling** | `middleware/errorHandler.js`, try/catch in all routes |
| **MVC-style separation** | Models: `models/`, Routes/Controllers: `routes/`, Views: `public/` |

> **Note on MVC:** Jobora follows a model–route–view pattern. `routes/` files act as controllers (handling request/response logic). `models/` files define data schemas. `public/` is the client-side view. This is a practical simplification appropriate for a student project, not a strict MVC framework.

---

## 📄 License

Created as a Web Application Development (WAD) academic project. For educational use only.

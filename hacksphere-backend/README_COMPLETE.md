# HackSphere Backend API Server

The backend API server for HackSphere - an AI-powered hackathon platform connecting students, enabling collaboration, and providing AI-driven insights for project success.

## 🎯 Project Overview

HackSphere solves three core problems:
1. **Networking Barriers** - AI-powered student and team matching
2. **Idea Validation** - LLM-based feasibility and impact scoring
3. **Progress Tracking** - Real-time milestone management and leaderboards

## 🚀 Key Features

### ✅ Core Features (Completed)
- **AI-Powered Idea Validation** - Groq Llama 3.3 70B scores ideas on feasibility, originality, impact, scope
- **Smart Student Matching** - AI recommends teammates based on skills, department, year, and compatibility
- **Team Recommendations** - Algorithm matches unmatched students with compatible open teams
- **5-Stage Progress Tracking** - Milestone-based tracking with automated percentage calculation
- **Admin Dashboard** - Full management of ideas, submissions, and teams
- **Notification System** - Real-time notifications for invites, validations, achievements
- **Public Project Gallery** - Showcase accepted projects with links to GitHub and demos
- **Leaderboard System** - Teams ranked by progress percentage
- **Multi-role Access Control** - Student, Mentor, Admin with appropriate permissions
- **Secure JWT Authentication** - 7-day token expiration with role-based authorization

### 🔐 Security Features
- Password hashing with bcryptjs (10 salt rounds)
- JWT token verification on protected routes
- Role-based middleware (requireAdmin, requireMentor)
- CORS configuration with origin whitelisting
- Request validation and error handling
- No sensitive data in API responses

### 📊 Data Models
- **User** - Students, mentors, admins with skills and department tracking
- **Team** - 4-5 member collaborative units with leader designation
- **Idea** - AI-validated project concepts with multi-dimensional scoring
- **Progress** - Milestone tracking with deadline management
- **Submission** - Final project deliverables with review workflow
- **Notification** - Typed alerts with read status and priority
- **JoinRequest & CollaborationRequest** - Team formation workflows

---

## 📋 Prerequisites

- Node.js 16+ or higher
- MongoDB (local installation or MongoDB Atlas cloud)
- Groq API key (free tier available: console.groq.com)
- Email service credentials (Gmail/SendGrid for notifications)
- npm or yarn package manager

---

## 🛠️ Installation & Setup

### 1. Clone Repository
```bash
cd hacksphere-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables

Create `.env` file in root directory:
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/hacksphere

# Authentication
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_recommended

# AI Engine - Groq
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
GROQ_MODEL=llama-3.3-70b-versatile

# Frontend & Email
FRONTEND_URL=http://localhost:5173
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
```

**Groq API Setup:**
1. Go to console.groq.com
2. Sign up for free account
3. Create API key in dashboard
4. Paste key in .env as GROQ_API_KEY

**Gmail Setup (for emails):**
1. Enable 2FA on Google Account
2. Generate App Password: myaccount.google.com/apppasswords
3. Use app password in EMAIL_PASSWORD

### 4. Start MongoDB

**Local:**
```bash
mongod
```

**Cloud (MongoDB Atlas):**
- Create cluster at mongodb.com/cloud
- Get connection string
- Update MONGODB_URI in .env

### 5. Start Server

```bash
# Development with nodemon
npm run dev

# Production
npm start
```

Server runs at: **http://localhost:5000**
Health check: **http://localhost:5000/api/health**

---

## 📂 Project Structure

```
hacksphere-backend/
├── __tests__/                    # Test suite
│   ├── auth.test.js             # Auth tests
│   ├── ideas.test.js            # Idea validation tests
│   └── progress.test.js         # Progress tracking tests
├── config/
│   └── db.js                    # MongoDB connection setup
├── middleware/
│   └── auth.js                  # JWT verification & role checks
├── models/
│   ├── User.js                  # User profile with skills
│   ├── Team.js                  # Team with members & leader
│   ├── Idea.js                  # Idea with AI scores
│   ├── Progress.js              # Milestone tracking
│   ├── Submission.js            # Final project submission
│   ├── Notification.js          # Notification system
│   ├── JoinRequest.js           # Join workflows
│   └── CollaborationRequest.js  # Collab workflows
├── routes/
│   ├── auth.js                  # Register, login
│   ├── teams.js                 # Create, join, manage teams
│   ├── ideas.js                 # Validate, submit ideas (AI)
│   ├── students.js              # Discovery, recommendations
│   ├── submissions.js           # Project submissions
│   ├── notifications.js         # Notification management
│   ├── joinRequests.js          # Join request workflows
│   ├── progress.js              # Progress tracking
│   ├── collaborationRequests.js # Collab workflows
│   └── leaderboard.js           # Leaderboard ranking
├── utils/
│   └── SendEmail.js             # Email sending service
├── server.js                    # Main Express app
├── .env                         # Environment variables (git-ignored)
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies & scripts
└── README.md                    # This file
```

---

## 🔌 API Endpoints (Complete Reference)

### 📍 Authentication Routes

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "role": "student",
  "department": "Computer Science",
  "year": "2nd",
  "skills": ["JavaScript", "React", "MongoDB"]
}

Response (200):
{ "_id": "user123", "token": "eyJhbGc...", "role": "student" }
```

#### Login
```
POST /api/auth/login
{ "email": "john@example.com", "password": "securepass123" }

Response (200):
{ "_id": "user123", "token": "eyJhbGc...", "name": "John Doe" }
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>

Response (200): { Current user object }
```

### 🏢 Team Routes

#### Create Team (4-5 members required)
```
POST /api/teams/create
Authorization: Bearer <token>

{
  "name": "Code Warriors",
  "description": "Building web3 apps",
  "memberEmails": ["member1@example.com", "member2@example.com", "member3@example.com"],
  "maxMembers": 5,
  "requiredSkills": ["JavaScript", "React"],
  "techStack": "MERN Stack",
  "openToMembers": false
}

Response (201): { Team object with invites sent }
```

#### Get Open Teams
```
GET /api/teams/open?filter=JavaScript
Response (200): [ { teams with openToMembers=true } ]
```

#### Get My Team
```
GET /api/teams/my-team
Authorization: Bearer <token>
Response (200): { Current user's team or null }
```

#### Get Recommended Teams
```
GET /api/teams/recommended
Authorization: Bearer <token>
Response (200): [ { teams sorted by compatibility score 0-100 } ]
```

### 💡 Ideas Routes

#### Validate Idea with AI
```
POST /api/ideas/validate
Authorization: Bearer <token>

{
  "title": "Smart Notification Manager",
  "description": "AI manages notifications intelligently",
  "problemStatement": "Users overwhelmed by notifications",
  "techStack": "React, Node.js, TensorFlow",
  "targetUsers": "Mobile professionals"
}

Response (200):
{
  "score": 82,
  "feasibilityScore": 85,
  "originalityScore": 80,
  "impactScore": 81,
  "scopeScore": 80,
  "feedback": "Well-scoped with good feasibility",
  "suggestions": ["Consider offline support", "Add privacy features"]
}
```

#### Get My Team's Idea
```
GET /api/ideas/my-idea
Authorization: Bearer <token>
Response (200): { Idea object with validation scores }
```

#### Submit Idea
```
POST /api/ideas/submit
Authorization: Bearer <token>
{ "title", "description", "problemStatement", "techStack", "targetUsers" }
Response (200): { Submitted idea with isValidated: true }
```

#### List All Ideas (Admin)
```
GET /api/ideas/admin/all
Authorization: Bearer <admin_token>
Response (200): [ All ideas in database ]
```

#### Approve/Reject Idea (Admin)
```
PUT /api/ideas/admin/override/:ideaId
Authorization: Bearer <admin_token>
{ "approved": true, "reason": "Strong execution" }
Response (200): { Updated idea }
```

#### Delete Idea (Admin)
```
DELETE /api/ideas/admin/:ideaId
Authorization: Bearer <admin_token>
Response (200): { Success message }
```

### 👥 Student Discovery Routes

#### Get Unmatched Students
```
GET /api/students/unmatched?filter=Python
Authorization: Bearer <token>
Response (200): [ { Students without teams } ]
```

#### Get Recommended Teammates
```
GET /api/students/recommended
Authorization: Bearer <token>
Response (200): [ { Students with matchScore 0-100, top 9 } ]
```

#### Get Recommended Teams to Join
```
GET /api/students/recommend/teams
Authorization: Bearer <token>
Response (200): [ { Open teams with compatibilityScore, top 6 } ]
```

#### Get Student Profile
```
GET /api/students/:studentId
Authorization: Bearer <token>
Response (200): { Student profile without password }
```

### 📊 Progress Routes

#### Get Team Progress
```
GET /api/progress/my-progress
Authorization: Bearer <token>

Response (200):
{
  "percentage": 45,
  "ideaValidated": true,
  "repoCreated": false,
  "prototypeStarted": true,
  "midCheckpoint": false,
  "finalSubmission": false,
  "deadlines": { "ideaValidationBy": "2024-02-01" }
}
```

#### Update Progress Milestone (Team Leader)
```
PATCH /api/progress/update
Authorization: Bearer <token>

{ "repoCreated": true, "prototypeStarted": true }
Response (200): { Updated progress with recalculated percentage }
```

#### Get Progress Alerts
```
GET /api/progress/alerts
Authorization: Bearer <token>

Response (200):
{
  "team": { "id", "name", "leader" },
  "alerts": [
    { "type": "milestone", "message": "Idea not validated", "priority": "high" },
    { "type": "deadline", "message": "Final submission in 2 days", "priority": "high" }
  ]
}
```

#### Get Leaderboard
```
GET /api/progress/leaderboard
Response (200): [ Teams sorted by percentage descending ]
```

### 📤 Submission Routes

#### Submit Final Project (Team Leader)
```
POST /api/submissions/submit
Authorization: Bearer <token>

{
  "title": "Final Project Name",
  "description": "Project overview",
  "githubUrl": "https://github.com/repo",
  "demoUrl": "https://demo.example.com"  (optional)
}

Response (200): { Submission + updated progress }
```

#### Get My Submission
```
GET /api/submissions/my
Authorization: Bearer <token>
Response (200): { Team's submission or null }
```

#### Get Public Gallery
```
GET /api/submissions/gallery/public
Response (200): [ Accepted submissions, max 12 ]
```

#### List All Submissions (Admin)
```
GET /api/submissions/admin/all
Authorization: Bearer <admin_token>
Response (200): [ All submissions ]
```

#### Update Submission Status (Admin)
```
PATCH /api/submissions/admin/:submissionId
Authorization: Bearer <admin_token>

{ "status": "accepted | rejected | submitted | pending" }
Response (200): { Updated submission }
```

### 🔔 Notification Routes

#### Get My Notifications
```
GET /api/notifications?isRead=false
Authorization: Bearer <token>
Response (200): [ Notifications sorted by newest first ]
```

#### Get Unread Count
```
GET /api/notifications/unread/count
Authorization: Bearer <token>
Response (200): { "unreadCount": 5 }
```

#### Mark as Read
```
PATCH /api/notifications/:notificationId/read
Authorization: Bearer <token>
Response (200): { Updated notification }
```

#### Mark All as Read
```
PATCH /api/notifications/read/all
Authorization: Bearer <token>
Response (200): { Success message }
```

#### Create System Announcement (Admin)
```
POST /api/notifications/admin/announcement
Authorization: Bearer <admin_token>

{ "title": "Important Update", "message": "...", "priority": "high" }
Response (200): { "Announcement sent to X users" }
```

---

## 📈 Progress Calculation Formula

```
Percentage = weighted sum of completed milestones:
- Idea Validated: 30%
- Repository Created: 20%
- Prototype Started: 20%
- Mid-Checkpoint Submitted: 15%
- Final Submission: 15%

Example: If ideaValidated=true, repoCreated=true, prototypeStarted=false:
Percentage = 30 + 20 + 0 + 0 + 0 = 50%
```

---

## 🤖 AI Features (Groq Integration)

### Idea Validation
- **Model**: Llama 3.3 70B via Groq API
- **Scoring dimensions**: Feasibility, Originality, Impact, Scope (0-100)
- **Output**: Structured JSON with feedback and improvement suggestions
- **Cost**: ~$0.01 per request (Groq free tier: 30 requests/minute)

### Student Matching
- **Algorithm**: Skill compatibility (40%) + Department (20%) + Year (15%) + Availability (15%) + Communication (10%)
- **Model**: Groq Llama 3.3 70B
- **Returns**: Top 9 most compatible teammates

### Team Recommendations
- **Input**: Student profile, skills, department
- **Algorithm**: Team skill requirements vs student skills + team idea progress
- **Returns**: Top 6 compatible open teams

---

## 🧪 Testing

Run tests:
```bash
npm test
```

Test coverage:
- Authentication (registration, login, token validation)
- Ideas (validation, submission, approval)
- Teams (creation, team formation)
- Progress (milestone tracking, calculations)
- Students (matching algorithms)

---

## 📝 Environment Configuration

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| PORT | Number | Yes | Server port (default: 5000) |
| MONGODB_URI | String | Yes | MongoDB connection string |
| JWT_SECRET | String | Yes | Secret for JWT signing (min 32 chars) |
| GROQ_API_KEY | String | Yes | API key from console.groq.com |
| GROQ_MODEL | String | No | Groq model (default: llama-3.3-70b-versatile) |
| FRONTEND_URL | String | No | Frontend URL for CORS |
| EMAIL_USER | String | Yes (for emails) | Gmail address |
| EMAIL_PASSWORD | String | Yes (for emails) | Gmail app password |

---

## 🔒 Security Best Practices

✅ **Implemented**:
- JWT tokens with expiration
- Password hashing (bcryptjs)
- Role-based access control
- Input validation
- CORS whitelisting
- Sensitive field exclusion
- Error handling

⚠️ **Recommended Future**:
- HTTP-only cookies
- Rate limiting
- Request logging
- Refresh tokens
- 2FA support
- API versioning
- Audit trails

---

## 📚 Architecture & Full Documentation

See comprehensive documentation:
- **[ARCHITECTURE_SECURITY.md](../ARCHITECTURE_SECURITY.md)** - Security implementation details
- **[API_DOCUMENTATION.md](../API_DOCUMENTATION.md)** - Detailed endpoint reference
- **[FUTURE_ROADMAP.md](../FUTURE_ROADMAP.md)** - Phase 2-7 feature roadmap

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
```
Error: connect ECONNREFUSED
Solution: Ensure MongoDB is running (mongod command)
```

### Groq API Errors
```
Error: 429 Rate Limited
Solution: Free tier has 30 requests/minute limit
```

### CORS Errors
```
Error: Access-Control-Allow-Origin
Solution: Check FRONTEND_URL in .env matches frontend origin
```

### Email Not Sending
```
Solution: Verify EMAIL_USER and EMAIL_PASSWORD are correct
Use Gmail App Password, not regular password
```

---

## 🚀 Deployment

### Heroku Deployment
```bash
git push heroku main
heroku config:set PORT=5000 MONGODB_URI=... etc
```

### Docker
```dockerfile
FROM node:16
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use strong JWT_SECRET (min 64 chars)
- Use MongoDB Atlas cluster
- Enable HTTPS
- Use HTTP-only cookies

---

## 📞 Support & Contributing

For issues or questions:
1. Check [ARCHITECTURE_SECURITY.md](../ARCHITECTURE_SECURITY.md) for security concerns
2. Review test files in `__tests__/` for usage examples
3. Check endpoint documentation above
4. Review error messages and logs

---

## 📄 License

Proprietary - HackSphere Platform

---

**Last Updated**: May 2026
**Version**: 1.0.0
**Status**: ✅ Production Ready

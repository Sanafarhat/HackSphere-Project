# HackSphere API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://api.hacksphere.com/api
```

## Authentication
Most endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### POST /auth/register
Register a new user
```json
Request:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",
  "department": "Computer Science",
  "year": "2nd",
  "skills": ["JavaScript", "React", "MongoDB"]
}

Response (200):
{
  "_id": "user123",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "token": "eyJhbGc..."
}
```

### POST /auth/login
Login user
```json
Request:
{
  "email": "john@example.com",
  "password": "password123"
}

Response (200):
{
  "_id": "user123",
  "token": "eyJhbGc...",
  "name": "John Doe",
  "role": "student"
}
```

---

## Ideas Endpoints

### POST /ideas/validate
Validate an idea with AI scoring (Team leader only)
```json
Request (Auth required):
{
  "title": "Smart Notification App",
  "description": "AI-powered notification management system",
  "problemStatement": "Users overwhelmed by notifications",
  "techStack": "React, Node.js, TensorFlow",
  "targetUsers": "Mobile users, professionals"
}

Response (200):
{
  "_id": "idea123",
  "score": 82,
  "feasibilityScore": 85,
  "originalityScore": 80,
  "impactScore": 81,
  "scopeScore": 80,
  "feedback": "Well-scoped with good implementation feasibility",
  "suggestions": ["Add offline support", "Consider privacy implications"]
}
```

### GET /ideas/my-idea
Get current user's team idea
```json
Response (200):
{
  "_id": "idea123",
  "title": "Smart Notification App",
  "description": "AI-powered system",
  "validationScore": 82,
  "isValidated": true,
  "isApproved": true
}
```

### GET /ideas/admin/all
Get all ideas (Admin only)
```
Auth: Required, Admin role
Response (200): Array of all ideas with scores and status
```

### PUT /ideas/admin/override/:ideaId
Override idea approval (Admin only)
```json
Request:
{
  "approved": true,
  "reason": "Strong technical execution"
}
```

### DELETE /ideas/admin/:ideaId
Delete an idea (Admin only)
```
Auth: Required, Admin role
Response: 200 - Idea deleted
```

---

## Teams Endpoints

### POST /teams/create
Create a new team (4-5 members required)
```json
Request (Auth required):
{
  "name": "Code Warriors",
  "description": "Building amazing apps",
  "memberEmails": ["member1@example.com", "member2@example.com", "member3@example.com"],
  "maxMembers": 5,
  "requiredSkills": ["JavaScript", "React"],
  "techStack": "MERN Stack",
  "openToMembers": false
}

Response (201):
{
  "_id": "team123",
  "name": "Code Warriors",
  "leader": {...},
  "members": [...],
  "pendingInvites": [...]
}
```

### GET /teams/my-team
Get current user's team
```
Auth: Required
Response (200): Team object or null
```

### GET /teams/open
Get all open teams accepting members
```
Auth: Not required
Response (200): Array of open teams
```

### GET /teams/recommended
Get AI-recommended teams for student
```
Auth: Required
Response (200): Array of teams with compatibility scores (0-100)
```

### GET /teams/admin/all
Get all teams (Admin only)
```
Auth: Required, Admin role
Response (200): Array of all teams with full details
```

---

## Students Endpoints

### GET /students/unmatched
Get unmatched students (searching for team)
```json
Request query:
  ?filter=keyword (optional)

Response (200):
Array of student profiles matching filter:
[
  {
    "_id": "student1",
    "name": "Alice",
    "skills": ["Python", "React"],
    "department": "CSE",
    "year": "3rd"
  }
]
```

### GET /students/recommended
Get AI-recommended teammates
```
Auth: Required
Response (200): Array of recommended students with match scores (0-100)
```

### GET /students/recommend/teams
Get AI-recommended teams to join
```
Auth: Required
Response (200): 
Array of compatible open teams:
[
  {
    "_id": "team123",
    "name": "Code Warriors",
    "compatibilityScore": 92,
    "matchReason": "Strong skill overlap..."
  }
]
```

### GET /students/:studentId
Get student profile by ID
```
Auth: Required
Response (200): Student object without password
```

---

## Progress Endpoints

### GET /progress/my-progress
Get team's current progress
```
Auth: Required
Response (200):
{
  "percentage": 45,
  "ideaValidated": true,
  "repoCreated": false,
  "prototypeStarted": true,
  "midCheckpoint": false,
  "finalSubmission": false,
  "deadlines": {...}
}
```

### PATCH /progress/update
Update progress milestone (Team leader only)
```json
Request (Auth required):
{
  "repoCreated": true,
  "prototypeStarted": true,
  "midCheckpoint": false
}

Response (200): Updated progress object
```

### GET /progress/alerts
Get alerts for team (deadlines, pending milestones)
```
Auth: Required
Response (200):
{
  "team": {...},
  "alerts": [
    {
      "type": "milestone",
      "message": "Idea not validated yet",
      "priority": "high"
    }
  ]
}
```

### GET /progress/leaderboard
Get teams ranked by progress
```
Auth: Not required
Response (200): Sorted array of teams by percentage
```

---

## Submissions Endpoints

### POST /submissions/submit
Submit final project (Team leader only)
```json
Request (Auth required):
{
  "title": "Final Project Name",
  "description": "Project description",
  "githubUrl": "https://github.com/...",
  "demoUrl": "https://demo.example.com" (optional)
}

Response (200): Submission and updated progress
```

### GET /submissions/my
Get team's submission
```
Auth: Required
Response (200): Submission object or null
```

### GET /submissions/gallery/public
Get public gallery (accepted projects)
```
Auth: Not required
Response (200): Array of accepted submissions
```

### GET /submissions/admin/all
Get all submissions (Admin only)
```
Auth: Required, Admin role
Response (200): Array of all submissions
```

### PATCH /submissions/admin/:submissionId
Update submission status (Admin only)
```json
Request (Auth required):
{
  "status": "accepted" | "rejected" | "submitted" | "pending"
}

Response (200): Updated submission
```

---

## Notifications Endpoints

### GET /notifications
Get user's notifications
```json
Request query:
  ?isRead=true|false (optional - filter)

Response (200):
Array of notifications:
[
  {
    "_id": "notif123",
    "type": "team_invite",
    "title": "Invitation to Join Team",
    "message": "...",
    "isRead": false,
    "priority": "high",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

### GET /notifications/unread/count
Get count of unread notifications
```
Auth: Required
Response (200): { "unreadCount": 5 }
```

### PATCH /notifications/:notificationId/read
Mark notification as read
```
Auth: Required
Response (200): Updated notification
```

### PATCH /notifications/read/all
Mark all notifications as read
```
Auth: Required
Response (200): Success message
```

### DELETE /notifications/:notificationId
Delete notification
```
Auth: Required
Response (200): Success message
```

### POST /notifications/admin/announcement
Create system announcement (Admin only)
```json
Request (Auth required):
{
  "title": "Important Update",
  "message": "All teams must submit by...",
  "priority": "high" | "medium" | "low"
}

Response (200):
{
  "message": "Announcement sent to 500 users",
  "count": 500
}
```

---

## Error Responses

All endpoints return errors in this format:
```json
{
  "message": "Error description"
}
```

### Common Status Codes
- **400**: Bad Request - Validation failed
- **401**: Unauthorized - Missing or invalid token
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource doesn't exist
- **500**: Server Error - Internal server error

---

## Rate Limiting (Recommended Implementation)

Currently not implemented. When added:
- Authentication endpoints: 5 requests/minute
- API endpoints: 60 requests/minute per user
- Admin endpoints: 100 requests/minute

---

## Response Pagination (Recommended Implementation)

Endpoints returning arrays should support:
```
?page=1&limit=20&sort=-createdAt
```

---

## API Versioning

Current version: v1 (implicit in /api endpoints)

For future versions:
```
/api/v2/endpoint
/api/v3/endpoint
```

---

## WebSocket Support (Future Feature)

For real-time notifications and team collaboration:
```
wss://api.hacksphere.com/socket.io
```

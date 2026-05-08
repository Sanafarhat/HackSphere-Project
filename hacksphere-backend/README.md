# HackSphere Backend

The backend API server for HackSphere - an AI-powered hackathon platform.

## 🚀 Features

- **JWT Authentication** - Secure user authentication and authorization
- **MongoDB Integration** - Persistent data storage
- **Groq AI Integration** - LLM-powered idea validation
- **Email Notifications** - Team invitations and notifications via Nodemailer
- **Role-based Access Control** - Student, mentor, and admin roles
- **RESTful API** - Clean and organized endpoints

## 📋 Prerequisites

- Node.js 16+
- MongoDB (local or MongoDB Atlas)
- Groq API key
- Gmail account (for email notifications)
- npm or yarn

## 🛠️ Installation

### 1. Clone and Install

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hacksphere
JWT_SECRET=your_super_secret_jwt_key
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
FRONTEND_URL=http://localhost:5173
```

### 3. Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**Or use MongoDB Atlas Cloud** and update MONGODB_URI in .env

### 4. Run Development Server

```bash
npm run dev
```

Server starts at `http://localhost:5000`

## 📁 Project Structure

```
├── config/
│   └── db.js              # MongoDB connection
├── middleware/
│   └── auth.js            # JWT verification & role checks
├── models/
│   ├── User.js            # User schema
│   ├── Team.js            # Team schema
│   ├── Idea.js            # Idea schema
│   ├── JoinRequest.js     # Join request schema
│   └── CollaborationRequest.js
├── routes/
│   ├── auth.js            # Auth endpoints
│   ├── teams.js           # Team endpoints
│   ├── ideas.js           # Idea validation endpoints
│   ├── joinRequests.js    # Join request endpoints
│   ├── collaborationRequests.js
│   └── students.js        # Student discovery
├── server.js              # Main server file
└── .env                   # Environment variables
```

## 🔌 API Endpoints

### Authentication

#### Register
```
POST /api/auth/register
Body: { name, email, password, role, department, year, skills }
```

#### Login
```
POST /api/auth/login
Body: { email, password }
```

#### Get Current User
```
GET /api/auth/me
Headers: { Authorization: "Bearer {token}" }
```

### Teams

#### Create Team
```
POST /api/teams/create
Body: { name, description, requiredSkills, techStack, openToMembers, memberEmails }
```

#### Get Open Teams
```
GET /api/teams/open?filter=searchTerm
```

#### Get My Team
```
GET /api/teams/my-team
```

#### Get Team by ID
```
GET /api/teams/:teamId
```

### Ideas

#### Validate Idea (AI)
```
POST /api/ideas/validate
Body: { title, description, problemStatement, techStack, targetUsers }
Returns: { score, feasibilityScore, originalityScore, impactScore, scopeScore, feedback, suggestions }
```

#### Submit Idea
```
POST /api/ideas/submit
Body: { title, description, problemStatement, techStack, targetUsers, validationScore }
```

#### Get My Idea
```
GET /api/ideas/my-idea
```

#### Get All Ideas (Admin)
```
GET /api/ideas/admin/all
```

#### Override Idea Approval (Admin)
```
PUT /api/ideas/admin/override/:ideaId
Body: { reason, approved }
```

### Join Requests (PATH 2)

#### Send Join Request
```
POST /api/join-requests/send
Body: { teamId, message }
```

#### Get Sent Requests
```
GET /api/join-requests/sent
```

#### Get Team Requests
```
GET /api/join-requests/team/:teamId
```

#### Respond to Join Request
```
PUT /api/join-requests/respond/:requestId
Body: { status: "accepted" | "rejected" }
```

### Collaboration Requests (PATH 3)

#### Send Bulk Collaboration Requests
```
POST /api/collaboration-requests/send-bulk
Body: { studentIds: ["id1", "id2", "id3"] }
```

#### Get Sent Requests
```
GET /api/collaboration-requests/sent
```

#### Get Received Requests
```
GET /api/collaboration-requests/received
```

#### Respond to Collaboration Request
```
PUT /api/collaboration-requests/respond/:requestId
Body: { status: "accepted" | "rejected" }
```

### Students

#### Get Unmatched Students
```
GET /api/students/unmatched?filter=searchTerm
```

#### Get Student by ID
```
GET /api/students/:studentId
```

## 🤖 AI Integration (Groq)

The idea validator uses Groq's API with Llama 3.3 70B model:

```javascript
const prompt = `Analyze this hackathon idea...`;
const message = await groq.messages.create({
  model: 'llama-3.3-70b-versatile',
  max_tokens: 1000,
  messages: [{ role: 'user', content: prompt }]
});
```

Returns structured JSON with:
- Overall score (0-100)
- Dimension scores (feasibility, originality, impact, scope)
- Detailed feedback
- Improvement suggestions

## 🔐 Authentication Flow

1. User registers/logs in
2. Backend validates credentials
3. JWT token generated and sent to frontend
4. Frontend stores token in localStorage
5. Token sent in Authorization header for protected routes
6. Backend verifies token with `verifyToken` middleware

## 📊 Data Models

### User
```javascript
{
  name, email, password,
  role: 'student' | 'mentor' | 'admin',
  department, year, skills[],
  availability, hasTeam,
  team (ref), idea (ref)
}
```

### Team
```javascript
{
  name, description,
  leader (ref), members[] (ref),
  idea (ref),
  requiredSkills[], techStack,
  openToMembers, maxMembers,
  joinRequests[]
}
```

### Idea
```javascript
{
  title, description, problemStatement,
  techStack, targetUsers,
  submittedBy (ref), team (ref),
  validationScore, feasibilityScore, originalityScore, impactScore, scopeScore,
  feedback, suggestions[],
  isValidated, isApproved,
  adminOverride {}
}
```

## 🚀 Deployment

### Using Render

```bash
# Connect GitHub repo to Render
# Set environment variables in Render dashboard
# Deploy automatically on push
```

### Using Railway

```bash
# Connect GitHub repo to Railway
# Auto-deploy on push
```

### Using Heroku

```bash
heroku create hacksphere-api
git push heroku main
```

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection | mongodb://... |
| JWT_SECRET | JWT signing key | secret123 |
| GROQ_API_KEY | Groq API key | gsk_... |
| GROQ_MODEL | Groq model name | llama-3.3-70b-versatile |
| FRONTEND_URL | Frontend URL | http://localhost:5173 |
| SMTP_HOST | Email host | smtp.gmail.com |
| SMTP_USER | Email address | your@gmail.com |
| SMTP_PASS | App password | xxxx xxxx xxxx xxxx |

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Check MongoDB is running: `mongod`
- Verify MONGODB_URI is correct
- Check network access if using Atlas

### Groq API Errors
- Verify GROQ_API_KEY is set
- Check Groq API status
- Ensure rate limits not exceeded

### JWT Errors
- Change JWT_SECRET in .env and .db
- Clear frontend localStorage
- Re-login user

### CORS Issues
- Verify FRONTEND_URL in .env
- Check frontend sending correct origin header

## 📚 Technologies

- Express.js - Web framework
- MongoDB - Database
- Mongoose - ODM
- JWT - Authentication
- Groq SDK - AI integration
- Bcryptjs - Password hashing
- Nodemailer - Email
- Cors - Cross-origin

## 🎯 Future Enhancements

- [ ] Real-time notifications (Socket.io)
- [ ] Email invitations via Nodemailer
- [ ] Progress tracking with standup updates
- [ ] Mentoring assignment
- [ ] Judging interface
- [ ] Results dashboard
- [ ] Project gallery
- [ ] Payment integration (Razorpay)

## 📞 Support

Check error logs for debugging:
```bash
# Development
npm run dev

# Check logs for stack traces
```

## 📄 License

This project is part of HackSphere - an educational hackathon platform.

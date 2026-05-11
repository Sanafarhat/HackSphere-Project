# HackSphere Architecture & Security Documentation

## System Architecture

### Technology Stack
- **Frontend**: React 18+ with React Router, Axios, TailwindCSS
- **Backend**: Express.js with Node.js
- **Database**: MongoDB with Mongoose ODM
- **AI Engine**: Groq API (Llama 3.3 70B)
- **Email Service**: Nodemailer
- **Authentication**: JWT (JSON Web Tokens)

### Core Components

#### 1. **User Management System**
- Role-based access control (Student, Mentor, Admin)
- User profiles with skills, department, year tracking
- Team membership management
- Invitation and join request workflows

#### 2. **Team Collaboration**
- Team creation with 4-5 member validation
- Open/closed team status
- Team idea linking
- Pending invite management
- Collaboration and join request handling

#### 3. **Idea Validation & Scoring**
- AI-powered idea validation using Groq API
- Structured scoring: Feasibility, Originality, Impact, Scope
- Automatic Progress milestone creation on validation
- Admin override capability

#### 4. **Progress Tracking**
- 5-stage milestone system:
  - Idea Validated (30%)
  - Repository Created (20%)
  - Prototype Started (20%)
  - Mid-Checkpoint (15%)
  - Final Submission (15%)
- Team leader controls milestone updates
- Automated alerts for deadlines and milestones
- Leaderboard ranked by progress percentage

#### 5. **AI Recommendations**
- **Student Matching**: Groq-based teammate compatibility scoring
- **Team Recommendations**: Ranks open teams by compatibility
- Skill complementarity analysis
- Department and year similarity consideration

#### 6. **Admin Dashboard**
- Centralized idea, team, and submission management
- Approval/rejection workflows
- Idea deletion with team cleanup
- Submission status management
- System announcements
- Platform statistics and analytics

#### 7. **Notification System**
- Typed notifications (team_invite, idea_validated, milestone_reached, etc.)
- Read/unread tracking
- Priority levels (low, medium, high)
- Admin announcement broadcasting
- Timestamp-based sorting

#### 8. **Public Gallery**
- Showcases accepted/approved projects
- Links to GitHub repositories and demos
- Team information display
- Limited to accepted submissions

---

## Security Implementation

### 1. **Authentication & Authorization**

#### JWT Implementation
```
Token Structure: { userId, email, role, expiresIn: '7d' }
Storage: HTTP-only cookies (recommended) or localStorage (current - see below)
Verification: Middleware applies to all protected routes
```

**Current Implementation**:
- Tokens stored in localStorage (browser accessible)
- Bearer token in Authorization header
- 7-day expiration
- Role-based route guards (requireAdmin, requireMentor)

**Security Note**: localStorage is vulnerable to XSS attacks. Future versions should:
1. Use HTTP-only, Secure, SameSite cookies
2. Implement CSRF tokens
3. Add token refresh mechanism

#### Password Security
- **Algorithm**: bcryptjs with salt rounds = 10
- **Validation**: Minimum 6 characters (future: enforce stronger requirements)
- **Storage**: Never stored in plain text; always hashed before database

### 2. **Data Protection**

#### Sensitive Field Exclusion
- Passwords excluded from all API responses using `.select('-password')`
- Authentication middleware validates ownership
- Only team leaders can update team/progress data
- Users can only view their own team data

#### Database Constraints
- Required field validation on schema level
- Unique constraints on email fields
- Enum validation for status fields
- Foreign key references prevent orphaned data

### 3. **API Security**

#### CORS Configuration
- Whitelist specific origins (localhost:5173, deployed frontend URL, env-configured)
- Support server-to-server requests (no origin header)
- Credentials flag enabled for cookie handling
- Helpful logging for debugging

#### Input Validation
- Email format validation
- URL format validation for GitHub/demo links
- Team size validation (4-5 members only)
- Enum validation for status fields

#### Rate Limiting
**Current**: Not implemented
**Recommended**: Implement express-rate-limit to prevent:
- Brute force attacks
- Spam API calls
- DoS attacks

### 4. **Admin Controls**

#### Admin Endpoints
- Require requireAdmin middleware on sensitive operations
- Admin can approve/reject ideas
- Admin can override approval status
- Admin can manage submissions
- Admin can broadcast announcements
- Audit trail recommended for sensitive actions

#### Access Levels
- **Student**: Can create teams, validate ideas, join teams, view own progress
- **Mentor**: Can view teams and ideas (via requireMentor checks)
- **Admin**: Full access to all management endpoints

---

## API Endpoint Security Summary

| Endpoint | Auth Required | Admin Only | Role-Based | Security Notes |
|----------|---------------|-----------|-----------|-----------------|
| POST /api/auth/register | No | No | N/A | Email validation required |
| POST /api/auth/login | No | No | N/A | Password hashing required |
| POST /api/teams/create | Yes | No | Student | Team size validation (4-5) |
| POST /api/ideas/validate | Yes | No | Student | Team leader only |
| PATCH /api/progress/update | Yes | No | Student | Team leader only |
| GET /api/ideas/admin/all | Yes | Yes | Admin | Returns all ideas |
| PUT /api/ideas/admin/override | Yes | Yes | Admin | Override approval status |
| DELETE /api/ideas/admin | Yes | Yes | Admin | Soft delete recommended |
| POST /api/submissions/admin | Yes | Yes | Admin | Status management |
| POST /api/notifications/admin/announcement | Yes | Yes | Admin | Broadcast to all users |
| GET /api/students/recommend/teams | Yes | No | Student | AI-powered matching |

---

## Error Handling

### HTTP Status Codes Used
- **200**: Success
- **201**: Created (implicit in some endpoints)
- **400**: Bad request (validation, logic errors)
- **401**: Unauthorized (no token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not found (resource doesn't exist)
- **500**: Server error

### Error Response Format
```json
{
  "message": "Error description"
}
```

**Future Enhancement**: Implement consistent error codes and detailed error responses with actionable feedback.

---

## Best Practices Implemented

✅ **Implemented**:
- Env variable configuration
- Request validation
- Role-based access control
- Password hashing with bcryptjs
- Populate/lean queries for performance
- Error try-catch blocks
- Async/await patterns
- Module separation (routes, models, middleware)
- JWT token verification
- CORS configuration

⚠️ **Recommended Future Improvements**:
- HTTP-only cookies instead of localStorage
- Implement rate limiting
- Add request logging/audit trails
- Input sanitization (prevent NoSQL injection)
- Add comprehensive error codes
- Implement request validation middleware
- Add API documentation (Swagger/OpenAPI)
- Test coverage (test files created)
- Add email verification for registration
- Implement password reset flow
- Add refresh token mechanism

---

## Compliance & Privacy

- No sensitive data logged to console in production
- Database queries limited to necessary fields
- User data isolation maintained
- Admin actions can be logged for audit
- GDPR considerations: No tracking scripts, minimal data collection
- No third-party data sharing

---

## Scalability Considerations

### Current Implementation Handles:
- Up to 10,000 users (estimated)
- Database indexing on frequently queried fields
- Lean queries for list operations
- Async operations (emails, AI calls)

### For Higher Scale:
- Add Redis caching
- Implement database sharding
- Use CDN for static assets
- Implement API rate limiting
- Consider message queue (Bull/RabbitMQ)
- Load balancing
- Database replication

---

## Deployment Checklist

- [ ] Set all environment variables
- [ ] Configure MongoDB connection string
- [ ] Set Groq API key for AI features
- [ ] Configure CORS allowed origins
- [ ] Enable HTTPS in production
- [ ] Use HTTP-only cookies
- [ ] Implement CSRF protection
- [ ] Enable rate limiting
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure email service credentials
- [ ] Run test suite
- [ ] Security audit completed
- [ ] Database backups configured

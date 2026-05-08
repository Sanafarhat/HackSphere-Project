# HackSphere Frontend

A modern, AI-powered hackathon platform built with React, Vite, and Tailwind CSS.

## 🚀 Features

- **Landing Page** - Engaging homepage with countdown timer and feature showcase
- **Multi-step Registration** - Three distinct registration paths:
  - PATH 1: Have a team (invite teammates)
  - PATH 2: No team, no idea (find open teams)
  - PATH 3: No team, but have idea (find team members)
- **Student Dashboard** - Track team status, ideas, and progress
- **Team Discovery** - AI-powered team recommendations based on skill compatibility
- **Team Member Search** - Find solo students to join your team
- **Idea Validator** - AI-powered feedback on hackathon ideas
- **Authentication** - JWT-based auth with role-based access control
- **Responsive Design** - Mobile-first, fully responsive UI

## 📋 Prerequisites

- Node.js 16+
- npm or yarn
- Backend API running on `http://localhost:5000`

## 🛠️ Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Backend URL

Edit `vite.config.js` if your backend is running on a different URL:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
  }
}
```

### 3. Run Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── Navigation.jsx   # Navigation bar
│   └── ProtectedRoute.jsx
├── context/            # Context API
│   └── AuthContext.jsx  # Authentication state
├── pages/              # Page components
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx
│   ├── FindTeamPage.jsx
│   ├── FindMembersPage.jsx
│   └── IdeaValidatorPage.jsx
├── styles/            # Global styles
│   └── globals.css
├── App.jsx            # Main app component
└── main.jsx           # Entry point
```

## 🎨 Design System

The application uses:
- **Colors**: Dark theme with accent gold (#f0d94d) and primary purple (#b19cff)
- **Typography**: Playfair Display (headings), Inter (body)
- **Components**: Custom Tailwind CSS components with glass-morphism effects

## 🔑 Key Components

### Pages

#### HomePage
- Landing page with hero section
- Features showcase
- Journey timeline
- Countdown timer
- Prize information

#### RegisterPage
- Multi-step registration (4 steps)
- Personal info, password, team choice, and team details
- Dynamic forms based on registration path
- Email invitations for team members

#### DashboardPage
- Overview tab with team/idea/progress status
- Team management tab
- Idea details and validation scores
- Progress tracking with milestones

#### FindTeamPage (PATH 2)
- Browse open teams
- Search and filter
- Send join requests with messages
- View request status

#### FindMembersPage (PATH 3)
- Browse unmatched students
- Multi-select team members
- Bulk send collaboration invites

#### IdeaValidatorPage
- Submit idea details
- AI-powered validation with Groq
- View validation results and scores
- Get AI suggestions for improvement

### Context

#### AuthContext
- Manages user authentication state
- Stores JWT token in localStorage
- Provides login, register, logout functions
- User role and profile management

## 🔐 Authentication

- **JWT Token Storage**: localStorage (production should use httpOnly cookies)
- **Protected Routes**: ProtectedRoute component checks auth status
- **Role-based Access**: Different views for students, mentors, and admins
- **Auto-login**: Token persistence across sessions

## 📡 API Integration

All API calls are made through Axios with:
- Auto-attach JWT token to Authorization header
- Error handling and user feedback
- Base URL: `http://localhost:5000/api`

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

This creates optimized build in `dist/` folder.

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Environment Variables (Production)

Create `.env.production`:
```
VITE_API_URL=https://api.yourdomain.com
```

## 🎯 Next Steps

1. Connect to backend API
2. Set up Groq API for idea validation
3. Configure Nodemailer for email invitations
4. Add admin dashboard
5. Implement progress tracking
6. Add judging interface
7. Create project gallery

## 📚 Technologies

- React 18
- Vite (build tool)
- React Router v6
- Tailwind CSS
- Axios
- Lucide Icons
- Context API

## 🐛 Troubleshooting

### API Connection Issues
- Check backend is running on port 5000
- Verify CORS settings in backend
- Check browser console for errors

### Login Issues
- Clear browser localStorage
- Check backend database has user records
- Verify JWT secret matches between frontend and backend

### Styling Issues
- Run `npm run build` to verify Tailwind compilation
- Check browser DevTools for CSS conflicts

## 📞 Support

For issues or questions, please refer to backend documentation or project repository.

# MindGarden 🌱

A comprehensive mental health support platform designed specifically for students. MindGarden provides mood tracking, AI-powered chat support, professional counseling booking, wellness resources, and a supportive anonymous community.

## 🌟 Features

### Core Functionality
- **🔐 Authentication & Role Management**: Secure JWT-based auth with Student, Counselor, and Admin roles
- **💭 Mood Tracking**: Log daily emotions with sentiment analysis and automated escalation
- **🤖 AI-Powered Chatbot**: OpenAI integration with rule-based fallbacks for 24/7 support
- **📅 Counselor Booking System**: Schedule and manage therapy sessions with approval workflow
- **📚 Resource Library**: Searchable mental health articles, videos, and tools
- **👥 Anonymous Community**: Safe peer support with moderation and flagging systems
- **🌱 Wellness Garden**: Gamified progress tracking with points, streaks, and badges
- **🚨 Crisis Detection**: Automated escalation system for mental health emergencies

### Admin & Counselor Features
- **📊 Analytics Dashboard**: Real-time statistics and mood trend analysis
- **🔍 Escalation Management**: Review and respond to flagged content and crisis situations
- **👨‍⚕️ Professional Tools**: Counselor booking management and client overview
- **🛡️ Content Moderation**: Community post review and management system

### Privacy & Security
- **🔒 End-to-End Encryption**: Sensitive data protection with AES-256
- **🕵️ Anonymous Options**: Private community participation
- **📋 GDPR Compliant**: Privacy-first design with user consent management
- **🚨 Crisis Resources**: Immediate access to emergency mental health services

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB 7.0+
- Docker (optional)

### Local Development

1. **Clone the repository**
```bash
git clone <repository-url>
cd mindgarden-mern
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

3. **Environment Setup**
```bash
# Copy environment template
cp backend/.env.example backend/.env

# Edit the .env file with your configuration
# Required: MONGODB_URI, JWT_SECRET, ENCRYPTION_KEY
# Optional: OPENAI_API_KEY (for AI chat)
```

4. **Start MongoDB**
```bash
# Using Docker
docker run -d -p 27017:27017 --name mindgarden-mongo mongo:7.0

# Or use your local MongoDB installation
```

5. **Seed the database**
```bash
cd backend
npm run seed
```

6. **Start the application**
```bash
# From root directory - starts both backend and frontend
npm run dev

# Or start individually:
# Backend: cd backend && npm run dev
# Frontend: cd frontend && npm run dev
```

7. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Docker Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 👥 Demo Accounts

After running the seed script, you can use these demo accounts:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@mindgarden.com | password123 |
| **Counselor** | counselor@mindgarden.com | password123 |
| **Student** | student@mindgarden.com | password123 |
| **Student 2** | maya@mindgarden.com | password123 |
| **Student 3** | jordan@mindgarden.com | password123 |

## 🏗️ Architecture

### Backend (Node.js + Express)
```
backend/
├── models/           # Mongoose schemas
├── routes/           # API endpoints
├── middleware/       # Auth, validation, etc.
├── services/         # Business logic (LLM, etc.)
├── scripts/          # Database seeding
└── server.js         # Entry point
```

### Frontend (React + Vite)
```
frontend/
├── src/
│   ├── components/   # Reusable UI components
│   ├── pages/        # Route components
│   ├── contexts/     # React contexts (Auth, etc.)
│   └── App.jsx       # Main app component
├── public/           # Static assets
└── index.html        # Entry HTML
```

### Database Schema
- **Users**: Authentication, profiles, garden progress
- **Moods**: Encrypted mood entries with sentiment analysis
- **Bookings**: Counselor session scheduling
- **Resources**: Mental health articles and materials
- **Posts**: Anonymous community discussions
- **Escalations**: Crisis detection and response tracking

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test

# Watch mode
npm run test:watch
```

### Test Coverage
- Authentication flows
- Mood logging and escalation
- Booking system
- Community features
- Admin dashboard functionality

## 🚀 Deployment

### Environment Variables
```bash
# Production environment setup
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mindgarden
JWT_SECRET=your-super-secure-jwt-secret
ENCRYPTION_KEY=your-32-character-hex-encryption-key
OPENAI_API_KEY=your-openai-api-key
FRONTEND_URL=https://your-domain.com
```

### Deployment Options

#### Option 1: Heroku + MongoDB Atlas
1. Create Heroku app: `heroku create mindgarden-app`
2. Set up MongoDB Atlas cluster
3. Configure environment variables
4. Deploy: `git push heroku main`

#### Option 2: Render + MongoDB Atlas
1. Connect GitHub repository to Render
2. Configure build and start commands
3. Set environment variables
4. Deploy automatically on push

#### Option 3: Docker + VPS
1. Build images: `docker-compose build`
2. Deploy to your VPS
3. Configure reverse proxy (nginx)
4. Set up SSL certificates

## 🛡️ Security Features

### Data Protection
- **Encryption**: Sensitive mood notes encrypted with AES-256
- **Authentication**: JWT tokens with secure headers
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Comprehensive request validation
- **CORS**: Configured for secure cross-origin requests

### Privacy Measures
- **Anonymous Community**: Optional identity protection
- **Data Minimization**: Only collect necessary information
- **User Consent**: Clear consent flow for data usage
- **Right to Deletion**: Account deactivation and data removal

### Crisis Safety
- **Keyword Detection**: Automatic flagging of concerning content
- **Escalation Workflow**: Professional review of high-risk situations
- **Emergency Resources**: Always-available crisis contact information
- **Professional Integration**: Direct connection to counseling services

## 📊 Analytics & Monitoring

### User Analytics (Anonymized)
- Mood trend analysis
- Resource engagement metrics
- Community participation stats
- Crisis intervention effectiveness

### System Monitoring
- API performance metrics
- Database health checks
- Error tracking and logging
- User session analytics

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Standards
- ESLint configuration for consistent code style
- Prettier for code formatting
- Comprehensive error handling
- Security-first development practices

## 📞 Crisis Resources

**If you or someone you know is in immediate danger, please contact emergency services.**

### Immediate Help
- **Emergency Services**: 911
- **Suicide Prevention Lifeline**: 988
- **Crisis Text Line**: Text HOME to 741741
- **Online Crisis Chat**: [suicidepreventionlifeline.org/chat](https://suicidepreventionlifeline.org/chat)

### Additional Resources
- **NAMI Helpline**: 1-800-950-NAMI
- **Trevor Project** (LGBTQ+ youth): 1-866-488-7386
- **RAINN Sexual Assault Hotline**: 1-800-656-HOPE

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **SIH 2024**: Built for the Smart India Hackathon
- **Mental Health Professionals**: For guidance on crisis intervention
- **Student Community**: For feedback and feature requests
- **Open Source Libraries**: React, Express, MongoDB, and many others

## 📞 Support

For technical support or questions about MindGarden:
- Create an issue in this repository
- Contact the development team
- Check the documentation wiki

---

**Disclaimer**: MindGarden is a supportive platform that complements but does not replace professional mental health care. If you're experiencing a mental health emergency, please contact emergency services or a mental health professional immediately.

**Built with ❤️ for student mental health and wellbeing.**

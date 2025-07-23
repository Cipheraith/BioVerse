# 🏥 BioVerse Client - React TypeScript Frontend

[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0.5-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.11-38B2AC.svg)](https://tailwindcss.com/)

## 🌟 Overview

This is the frontend client for BioVerse - Zambia's first AI-Powered Predictive Health Twin Network. Built with modern React, TypeScript, and Tailwind CSS, it provides comprehensive healthcare management interfaces for patients, healthcare workers, and administrators.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend server running on `http://localhost:3000`

### Installation
```bash
# Clone and install
git clone <repo-url>
cd bioverse-client
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start development server
npm run dev
```

### Available Scripts
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint check
```

## 🏗️ Architecture

### Technology Stack
- **Frontend Framework**: React 19.1.0 with TypeScript
- **Build Tool**: Vite 7.0.5 with Hot Module Replacement
- **Styling**: Tailwind CSS 4.1.11 with custom design system
- **State Management**: React Context + Custom Hooks
- **Routing**: React Router 7.7.0
- **Real-time**: Socket.IO client 4.8.1
- **Authentication**: Firebase Auth with Google OAuth
- **Maps**: React Leaflet for clinic locations
- **Icons**: Lucide React + React Icons
- **Animations**: Framer Motion 12.23.6
- **PWA**: Vite PWA plugin with Workbox

### Key Features
- 🤖 **Digital Health Twins** - AI-powered patient health modeling
- 🏥 **Multi-Role Dashboards** - Patient, Health Worker, Admin, MOH interfaces
- 🚑 **Emergency Services** - Real-time ambulance dispatch
- 📱 **Telemedicine** - Video consultations and remote monitoring
- 🤱 **Maternal Health** - Pregnancy tracking and care coordination
- 💊 **Pharmacy Integration** - Medication management
- 📊 **Analytics** - Comprehensive health analytics and reporting
- 🌐 **Offline Support** - PWA with offline capabilities
- 🔒 **Security** - Role-based access control and data encryption

## 🎯 Dashboard Roles

### 👤 Patient Dashboard
- Personal health twin visualization
- Appointment booking and management
- Medication reminders
- Health records access
- Emergency alert system

### 👩‍⚕️ Health Worker Dashboard
- Patient management and records
- Health twin analysis and insights
- Appointment scheduling
- Telemedicine consultations
- Clinical decision support

### 🏛️ Admin Dashboard
- System analytics and monitoring
- User management
- Revenue and billing oversight
- Performance metrics
- Compliance monitoring

### 🏥 Ministry of Health Dashboard
- National health overview
- Population health analytics
- Resource allocation insights
- Policy management
- System performance monitoring

### 🚑 Ambulance Driver Dashboard
- Emergency call management
- GPS navigation and routing
- Patient transport coordination
- Status updates and communication

### 💊 Pharmacy Panel
- Medication inventory
- Prescription management
- Drug interaction alerts
- Supply chain coordination

## 🛠️ Development

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── common/         # Shared components
│   └── HealthTwin/     # Health twin specific components
├── pages/              # Dashboard pages
├── hooks/              # Custom React hooks
├── contexts/           # React context providers
├── services/           # API and external services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── styles/            # Global styles and themes
```

### Code Quality
- ✅ **0 ESLint Errors** - Clean, production-ready code
- ✅ **TypeScript Strict Mode** - Full type safety
- ✅ **Modern React Patterns** - Hooks, Context, Suspense
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Accessibility** - WCAG 2.1 compliant
- ✅ **Performance Optimized** - Code splitting and lazy loading

### Environment Variables
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000

# Firebase Configuration (optional)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id

# Feature Flags
VITE_ENABLE_TELEMEDICINE=true
VITE_ENABLE_OFFLINE_MODE=true
```

## 🔌 API Integration

The client integrates with the BioVerse backend API for:
- User authentication and authorization
- Patient data management
- Health twin generation and analysis
- Real-time notifications via Socket.IO
- File uploads and medical records

### Example API Usage
```typescript
import { healthTwinService } from './services/healthTwinService';

// Fetch patient health twin
const healthTwin = await healthTwinService.getHealthTwin(patientId);

// Update health data
await healthTwinService.updateHealthData(patientId, newData);
```

## 🎨 Design System

### Color Palette
- **Primary**: `#5A67D8` (Indigo) - Main brand color
- **Secondary**: `#48BB78` (Green) - Success and health
- **Accent**: `#ECC94B` (Yellow) - Warnings and highlights
- **Background**: `#F7FAFC` (Light gray) - Clean background
- **Text**: `#2D3748` (Dark gray) - Primary text

### Typography
- **Font Family**: Inter (system fallback)
- **Sizes**: Responsive scale from 12px to 48px
- **Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Components
- Modern card-based layouts
- Consistent spacing (4px grid)
- Rounded corners (4px, 8px, 12px)
- Subtle shadows and animations
- Mobile-first responsive design

## 📱 PWA Features

- **Offline Support** - Critical functionality works offline
- **Push Notifications** - Real-time health alerts
- **Install Prompt** - Add to home screen
- **Background Sync** - Data synchronization when online
- **Caching Strategy** - Intelligent resource caching

## 🧪 Testing

### Test Strategy
```bash
# Run tests (when implemented)
npm run test

# Type checking
npm run type-check

# Build verification
npm run build && npm run preview
```

### Testing Accounts
See `docs/TEST_ACCOUNTS_SUMMARY.md` for complete testing credentials.

## 🚀 Deployment

### Development
```bash
npm run dev
# Visit http://localhost:5173
```

### Production Build
```bash
npm run build
# Outputs to dist/ directory
```

### Static Hosting
Deploy the `dist/` folder to:
- Vercel (recommended)
- Netlify
- AWS S3 + CloudFront
- Azure Static Web Apps

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

## 🔒 Security

- **Authentication**: Firebase Auth with JWT tokens
- **Authorization**: Role-based access control
- **Data Protection**: Encrypted API communication
- **Input Validation**: Client-side validation with server verification
- **CORS**: Configured for secure cross-origin requests

## 📊 Performance

- **Bundle Size**: ~857KB minified (248KB gzipped)
- **First Contentful Paint**: <1.5s target
- **Time to Interactive**: <3s target
- **Lighthouse Score**: 90+ target for all metrics

### Optimization Techniques
- Code splitting with React.lazy()
- Tree shaking with Vite
- Image optimization and lazy loading
- Service worker caching
- Bundle analysis with rollup-plugin-analyzer

## 🌍 Internationalization

- **Framework**: i18next with react-i18next
- **Languages**: English (default), Bemba, Nyanja planned
- **RTL Support**: Prepared for future Arabic support
- **Date/Number Formatting**: Locale-aware formatting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with proper TypeScript types
4. Ensure all linting passes: `npm run lint`
5. Test the build: `npm run build`
6. Commit with conventional commits: `git commit -m "feat: add amazing feature"`
7. Push and create a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow React hooks patterns
- Implement responsive design
- Add proper error handling
- Include accessibility attributes
- Write semantic HTML

## 📞 Support

- **Documentation**: See `docs/` folder for comprehensive guides
- **API Reference**: `docs/API_DOCUMENTATION.md`
- **Issues**: GitHub Issues for bug reports and feature requests
- **Discussions**: GitHub Discussions for questions and ideas

## 🏆 Recognition

BioVerse represents Zambia's innovative approach to healthcare technology, combining AI, modern web technologies, and user-centered design to improve health outcomes for all citizens.

---

**Built with ❤️ for better healthcare in Zambia and beyond** 🇿🇲✨

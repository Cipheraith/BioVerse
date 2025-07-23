# BioVerse Server API Documentation

## Overview

The BioVerse server is a Node.js/Express.js backend system that powers the AI-Powered Predictive Health Twin Network. It provides comprehensive APIs for healthcare management, real-time communication, and advanced monitoring features.

## Table of Contents

1. [Authentication](#authentication)
2. [API Endpoints](#api-endpoints)
3. [Real-Time Features (Socket.IO)](#real-time-features-socketio)
4. [Performance Monitoring](#performance-monitoring)
5. [Notification System](#notification-system)
6. [Database Schema](#database-schema)
7. [Error Handling](#error-handling)
8. [Security](#security)

## Authentication

### JWT Token-Based Authentication

All protected routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Login Endpoint

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin@bioverse.com",
  "password": "Admin@BioVerse2025"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "admin",
  "id": 4
}
```

### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": 4,
  "username": "admin@bioverse.com",
  "role": "admin"
}
```

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/login` | User login | No |
| POST | `/register` | User registration | No |
| POST | `/google` | Google OAuth login | No |
| GET | `/me` | Get current user info | Yes |

### Appointment Routes (`/api/appointments`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| POST | `/` | Create appointment | Yes | health_worker, admin |
| GET | `/` | Get all appointments | Yes | health_worker, admin |
| GET | `/my` | Get user's appointments | Yes | patient |
| PUT | `/:id` | Update appointment | Yes | health_worker, admin |
| DELETE | `/:id` | Cancel appointment | Yes | health_worker, admin |

#### Create Appointment

```http
POST /api/appointments
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "patientId": "1",
  "patientName": "John Doe",
  "date": "2025-07-20",
  "time": "10:00",
  "type": "consultation",
  "notes": "Regular checkup",
  "healthWorkerId": "2"
}
```

**Response:**
```json
{
  "id": 1,
  "patientId": "1",
  "patientName": "John Doe",
  "date": "2025-07-20",
  "time": "10:00",
  "appointmentDate": 1721466000000,
  "type": "consultation",
  "notes": "Regular checkup",
  "healthWorkerId": "2",
  "status": "scheduled",
  "createdBy": "2",
  "createdAt": "2025-07-18T08:56:46.000Z"
}
```

### Notification Routes (`/api/notifications`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | Get user notifications | Yes | All |
| POST | `/` | Create notification | Yes | admin, moh |
| PUT | `/:id/read` | Mark as read | Yes | All |
| DELETE | `/:id` | Delete notification | Yes | All |
| GET | `/stats` | Get notification stats | Yes | admin, moh |
| GET | `/types` | Get notification types | Yes | All |

#### Get Notifications

```http
GET /api/notifications?limit=10&offset=0&unreadOnly=true
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "notifications": [
    {
      "id": "1721466000000",
      "type": "appointment",
      "priority": "medium",
      "title": "Appointment Scheduled",
      "message": "Your appointment has been scheduled for 2025-07-20 at 10:00",
      "data": {
        "patientId": "1",
        "date": "2025-07-20",
        "time": "10:00"
      },
      "recipientId": "1",
      "isRead": false,
      "createdAt": "2025-07-18T08:56:46.000Z"
    }
  ],
  "count": 1,
  "hasMore": false
}
```

### Performance Routes (`/api/performance`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/stats` | Get performance stats | Yes | admin, moh |
| POST | `/reset` | Reset performance stats | Yes | admin |
| GET | `/health` | System health check | No | - |

#### Performance Stats

```http
GET /api/performance/stats
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "uptime": 3600,
  "totalRequests": 1250,
  "totalErrors": 5,
  "avgResponseTime": "45.32",
  "errorRate": "0.40",
  "topEndpoints": [
    {
      "endpoint": "GET /api/appointments",
      "requests": 234,
      "avgResponseTime": 32.5,
      "errorRate": 0.85
    }
  ],
  "memoryUsage": {
    "rss": 45678592,
    "heapTotal": 29360128,
    "heapUsed": 18234567
  }
}
```

### Dashboard Routes (`/api/dashboard`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/stats` | Get dashboard statistics | Yes | admin, moh, health_worker |
| GET | `/recent-activity` | Get recent activity | Yes | admin, moh, health_worker |
| GET | `/national-health-overview` | National health overview | Yes | admin, moh |
| GET | `/system-performance` | System performance metrics | Yes | admin, moh |

### Patient Routes (`/api/patients`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | Get all patients | Yes | health_worker, admin |
| POST | `/` | Create patient | Yes | health_worker, admin |
| GET | `/:id` | Get patient by ID | Yes | health_worker, admin |
| PUT | `/:id` | Update patient | Yes | health_worker, admin |
| DELETE | `/:id` | Delete patient | Yes | admin |

### Health Twin Routes (`/api/health-twin`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/:patientId` | Get patient health twin | Yes | health_worker, admin |

## Real-Time Features (Socket.IO)

### Connection

```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Events

#### Appointment Events

**Schedule Appointment:**
```javascript
socket.emit('appointment:schedule', {
  patientId: '1',
  date: '2025-07-20',
  time: '10:00',
  type: 'consultation',
  notes: 'Regular checkup'
});
```

**Listen for Appointment Updates:**
```javascript
socket.on('appointment:scheduled', (appointment) => {
  console.log('New appointment scheduled:', appointment);
});

socket.on('appointment:cancelled', (data) => {
  console.log('Appointment cancelled:', data.id);
});

socket.on('appointment:error', (error) => {
  console.error('Appointment error:', error.message);
});
```

#### Emergency Events

**Send Emergency Alert:**
```javascript
socket.emit('emergency:alert', {
  patientId: '1',
  location: 'Main Street Clinic',
  severity: 'high',
  symptoms: 'chest pain, difficulty breathing'
});
```

**Listen for Emergency Alerts:**
```javascript
socket.on('emergency:new', (alert) => {
  console.log('New emergency alert:', alert);
});
```

#### User Status Events

**Update Status:**
```javascript
socket.emit('user:status', 'online');
```

**Listen for Status Updates:**
```javascript
socket.on('user:status:update', (status) => {
  console.log('User status updated:', status);
});
```

#### Notification Events

**Listen for Notifications:**
```javascript
socket.on('notification', (notification) => {
  console.log('New notification:', notification);
});
```

## Performance Monitoring

### Middleware

The server includes performance monitoring middleware that tracks:

- Request count
- Response times
- Error rates
- Memory usage
- Endpoint usage statistics

### Metrics Collection

Performance metrics are automatically collected and can be accessed via:

```http
GET /api/performance/stats
```

### Health Check

```http
GET /api/performance/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-07-18T08:56:46.000Z",
  "uptime": 3600,
  "memory": {
    "used": "18.23 MB",
    "total": "29.36 MB",
    "percentage": "62.08%"
  },
  "requests": {
    "total": 1250,
    "avgResponseTime": "45.32ms",
    "errorRate": "0.40%"
  }
}
```

## Notification System

### Notification Types

- `emergency` - Emergency alerts
- `appointment` - Appointment-related notifications
- `maternal_health` - Maternal health alerts
- `medication_reminder` - Medication reminders
- `health_alert` - General health alerts
- `transport_booking` - Transport booking notifications
- `system_update` - System updates

### Notification Priorities

- `low` - Non-urgent notifications
- `medium` - Standard notifications
- `high` - Important notifications
- `critical` - Emergency notifications

### Creating Notifications

```http
POST /api/notifications
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "type": "appointment",
  "priority": "medium",
  "title": "Appointment Reminder",
  "message": "Your appointment is tomorrow at 10:00 AM",
  "recipientId": "1",
  "data": {
    "appointmentId": "123",
    "date": "2025-07-20",
    "time": "10:00"
  }
}
```

## Database Schema

### Key Tables

#### Users
- `id` - Primary key
- `username` - Email address
- `password` - Hashed password
- `name` - Full name
- `role` - User role (admin, health_worker, patient, etc.)
- `dob` - Date of birth
- `nationalId` - National ID
- `phoneNumber` - Phone number

#### Appointments
- `id` - Primary key
- `patientId` - Foreign key to patients
- `patientName` - Patient name
- `date` - Appointment date
- `time` - Appointment time
- `appointmentDate` - Timestamp
- `type` - Appointment type
- `notes` - Additional notes
- `healthWorkerId` - Assigned health worker
- `status` - Appointment status
- `createdBy` - User who created the appointment
- `createdAt` - Creation timestamp

#### Patients
- `id` - Primary key
- `name` - Patient name
- `dateOfBirth` - Date of birth
- `gender` - Gender
- `contact` - Contact information
- `address` - Address
- `medicalHistory` - JSONB field
- `bloodType` - Blood type
- `allergies` - JSONB field
- `chronicConditions` - JSONB field
- `medications` - JSONB field
- `isPregnant` - Boolean flag

## Error Handling

### Standard Error Response

```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

### Common Error Scenarios

1. **Invalid JWT Token**
   ```json
   {
     "message": "Access Denied: Invalid token."
   }
   ```

2. **Missing Required Fields**
   ```json
   {
     "message": "Missing required appointment fields"
   }
   ```

3. **Appointment Conflict**
   ```json
   {
     "error": "Time slot already booked"
   }
   ```

## Security

### Authentication & Authorization

- JWT tokens with configurable expiration
- Role-based access control
- Secure password hashing with bcrypt

### CORS Configuration

```javascript
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
```

### Rate Limiting

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});
```

### Security Headers

The server uses Helmet.js for security headers:

- Content Security Policy
- XSS Protection
- HSTS
- Frame Options
- Content Type Options

## Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bioverse_zambia_db
DB_USER=bioverse_admin
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret

# CORS
CORS_ORIGIN=http://localhost:5173

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# API Configuration
API_RATE_LIMIT=1000
ENABLE_RATE_LIMITING=true
ENABLE_REQUEST_LOGGING=true
```

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/bioverse-server.git

# Navigate to server directory
cd bioverse-server

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
npm run db:init

# Start the server
npm start
```

### Development

```bash
# Start in development mode with auto-reload
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

### Production Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## API Testing

### Using cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@bioverse.com","password":"Admin@BioVerse2025"}'

# Get appointments (with token)
curl -X GET http://localhost:3000/api/appointments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create appointment
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "patientId": "1",
    "patientName": "John Doe",
    "date": "2025-07-20",
    "time": "10:00",
    "type": "consultation"
  }'
```

### Using Postman

1. Import the API collection
2. Set up environment variables for base URL and tokens
3. Test endpoints with various scenarios

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check database credentials in `.env`
   - Ensure PostgreSQL is running
   - Verify database exists

2. **JWT Token Issues**
   - Check JWT_SECRET in environment
   - Verify token format and expiration
   - Ensure proper Authorization header

3. **CORS Issues**
   - Verify CORS_ORIGIN matches client URL
   - Check allowed methods and headers

### Debug Mode

Enable debug logging:

```env
NODE_ENV=development
ENABLE_REQUEST_LOGGING=true
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, please contact:
- Email: support@bioverse.com
- Documentation: https://docs.bioverse.com
- Issues: https://github.com/bioverse/server/issues

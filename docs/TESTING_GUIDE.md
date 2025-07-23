# Testing Guide 🧪

This guide provides comprehensive information about testing the BioVerse server application.

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Test Setup](#test-setup)
3. [Testing Framework](#testing-framework)
4. [Test Categories](#test-categories)
5. [Running Tests](#running-tests)
6. [Writing Tests](#writing-tests)
7. [Test Coverage](#test-coverage)
8. [Continuous Integration](#continuous-integration)
9. [Healthcare-Specific Testing](#healthcare-specific-testing)
10. [Best Practices](#best-practices)

## Testing Philosophy

In healthcare technology, testing is critical for:
- **Patient Safety** - Ensuring system reliability affects patient outcomes
- **Data Integrity** - Protecting sensitive health information
- **Compliance** - Meeting healthcare regulations (HIPAA, GDPR)
- **Performance** - Ensuring system responsiveness in critical situations
- **Security** - Protecting against vulnerabilities and breaches

## Test Setup

### Prerequisites

```bash
# Install dependencies
npm install

# Install test dependencies (if not already installed)
npm install --save-dev jest supertest
```

### Environment Setup

Create a test environment file:

```bash
# Create test environment
cp .env.example .env.test
```

Configure `.env.test`:

```env
NODE_ENV=test
PORT=3001
DB_NAME=bioverse_test_db
JWT_SECRET=test_jwt_secret_key
CORS_ORIGIN=http://localhost:3000
API_RATE_LIMIT=1000
ENABLE_RATE_LIMITING=false
ENABLE_REQUEST_LOGGING=false
```

### Test Database Setup

```bash
# Create test database
createdb bioverse_test_db

# Run migrations for test database
NODE_ENV=test npm run db:migrate

# Seed test data
NODE_ENV=test npm run seed
```

## Testing Framework

### Jest Configuration

Create `jest.config.js`:

```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/config/**',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000,
  verbose: true
};
```

### Test Setup File

Create `tests/setup.js`:

```javascript
const { initializeDatabase } = require('../src/config/database');
const { logger } = require('../src/services/logger');

// Setup test database before running tests
beforeAll(async () => {
  await initializeDatabase();
  logger.info('Test database initialized');
});

// Cleanup after tests
afterAll(async () => {
  // Close database connections
  process.exit(0);
});

// Setup global test utilities
global.testUtils = {
  generateTestUser: () => ({
    username: 'test@example.com',
    password: 'TestPassword123!',
    name: 'Test User',
    role: 'patient'
  }),
  
  generateTestAppointment: () => ({
    patientId: '1',
    patientName: 'John Doe',
    date: '2025-07-20',
    time: '10:00',
    type: 'consultation',
    notes: 'Test appointment'
  })
};
```

## Test Categories

### 1. Unit Tests
Test individual functions and modules in isolation.

**Example: `tests/unit/auth.test.js`**
```javascript
const { validateToken } = require('../../src/middleware/auth');
const jwt = require('jsonwebtoken');

describe('Auth Middleware', () => {
  test('should validate valid JWT token', () => {
    const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET);
    const decoded = validateToken(token);
    expect(decoded.userId).toBe(1);
  });

  test('should reject invalid token', () => {
    expect(() => validateToken('invalid_token')).toThrow();
  });
});
```

### 2. Integration Tests
Test API endpoints and database interactions.

**Example: `tests/integration/appointments.test.js`**
```javascript
const request = require('supertest');
const app = require('../../src/app');

describe('Appointments API', () => {
  let authToken;
  let appointmentId;

  beforeAll(async () => {
    // Create test user and get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin@bioverse.com',
        password: 'Admin@BioVerse2025'
      });
    authToken = response.body.token;
  });

  test('should create appointment', async () => {
    const appointmentData = global.testUtils.generateTestAppointment();
    
    const response = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${authToken}`)
      .send(appointmentData);

    expect(response.status).toBe(201);
    expect(response.body.patientName).toBe(appointmentData.patientName);
    appointmentId = response.body.id;
  });

  test('should get appointments', async () => {
    const response = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('should update appointment', async () => {
    const updateData = { notes: 'Updated notes' };
    
    const response = await request(app)
      .put(`/api/appointments/${appointmentId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.notes).toBe(updateData.notes);
  });
});
```

### 3. End-to-End Tests
Test complete user workflows.

**Example: `tests/e2e/patient-workflow.test.js`**
```javascript
const request = require('supertest');
const app = require('../../src/app');

describe('Patient Workflow E2E', () => {
  test('complete patient journey', async () => {
    // 1. Patient registration
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'patient@test.com',
        password: 'Password123!',
        name: 'Test Patient',
        role: 'patient'
      });

    expect(registerResponse.status).toBe(201);
    const authToken = registerResponse.body.token;

    // 2. Book appointment
    const appointmentResponse = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        patientName: 'Test Patient',
        date: '2025-07-25',
        time: '14:00',
        type: 'consultation'
      });

    expect(appointmentResponse.status).toBe(201);

    // 3. View appointments
    const viewResponse = await request(app)
      .get('/api/appointments/my')
      .set('Authorization', `Bearer ${authToken}`);

    expect(viewResponse.status).toBe(200);
    expect(viewResponse.body.length).toBeGreaterThan(0);
  });
});
```

### 4. Performance Tests
Test system performance and scalability.

**Example: `tests/performance/load.test.js`**
```javascript
const request = require('supertest');
const app = require('../../src/app');

describe('Performance Tests', () => {
  test('should handle concurrent requests', async () => {
    const promises = [];
    const concurrentRequests = 100;

    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(
        request(app)
          .get('/health')
          .expect(200)
      );
    }

    const startTime = Date.now();
    await Promise.all(promises);
    const endTime = Date.now();

    const totalTime = endTime - startTime;
    const avgResponseTime = totalTime / concurrentRequests;

    expect(avgResponseTime).toBeLessThan(100); // Should respond within 100ms
  });
});
```

## Running Tests

### Available Test Scripts

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/unit/auth.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should create appointment"

# Run tests for specific category
npm test -- tests/integration/

# Run tests in verbose mode
npm test -- --verbose
```

### Test Environment Variables

```bash
# Run tests with specific environment
NODE_ENV=test npm test

# Run tests with debug output
DEBUG=* npm test

# Run tests with coverage threshold
npm test -- --coverage --coverageThreshold='{"global":{"branches":80,"functions":80,"lines":80,"statements":80}}'
```

## Writing Tests

### Test Structure

```javascript
describe('Feature/Component Name', () => {
  // Setup
  beforeAll(() => {
    // One-time setup
  });

  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  afterAll(() => {
    // Final cleanup
  });

  describe('when condition', () => {
    test('should do something', () => {
      // Arrange
      const input = 'test input';
      
      // Act
      const result = functionToTest(input);
      
      // Assert
      expect(result).toBe('expected output');
    });
  });
});
```

### Healthcare-Specific Test Examples

#### Testing Patient Data Privacy
```javascript
describe('Patient Data Privacy', () => {
  test('should not expose sensitive patient data', async () => {
    const response = await request(app)
      .get('/api/patients/1')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.password).toBeUndefined();
    expect(response.body.ssn).toBeUndefined();
  });
});
```

#### Testing Emergency Alerts
```javascript
describe('Emergency Alert System', () => {
  test('should send emergency alert immediately', async () => {
    const emergencyData = {
      patientId: '1',
      severity: 'critical',
      location: 'Room 101',
      symptoms: 'chest pain'
    };

    const response = await request(app)
      .post('/api/emergency/alert')
      .set('Authorization', `Bearer ${authToken}`)
      .send(emergencyData);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('alert_sent');
  });
});
```

#### Testing Health Data Validation
```javascript
describe('Health Data Validation', () => {
  test('should validate blood pressure ranges', () => {
    const invalidBP = { systolic: 300, diastolic: 200 };
    const validBP = { systolic: 120, diastolic: 80 };

    expect(() => validateBloodPressure(invalidBP)).toThrow();
    expect(() => validateBloodPressure(validBP)).not.toThrow();
  });
});
```

## Test Coverage

### Coverage Requirements

- **Minimum Coverage**: 80% for all metrics
- **Critical Paths**: 95% coverage for security and healthcare logic
- **New Features**: 90% coverage requirement

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

### Coverage Configuration

```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/services/security.js': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    }
  }
};
```

## Continuous Integration

### GitHub Actions Configuration

Create `.github/workflows/test.yml`:

```yaml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: bioverse_test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test:coverage
      env:
        NODE_ENV: test
        DB_HOST: localhost
        DB_PORT: 5432
        DB_NAME: bioverse_test_db
        DB_USER: postgres
        DB_PASSWORD: postgres
        JWT_SECRET: test_secret
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v1
```

## Healthcare-Specific Testing

### HIPAA Compliance Testing

```javascript
describe('HIPAA Compliance', () => {
  test('should encrypt patient data at rest', async () => {
    const patientData = { ssn: '123-45-6789', name: 'John Doe' };
    const encrypted = await encryptPatientData(patientData);
    
    expect(encrypted.ssn).not.toBe(patientData.ssn);
    expect(encrypted.name).not.toBe(patientData.name);
  });

  test('should audit all patient data access', async () => {
    await request(app)
      .get('/api/patients/1')
      .set('Authorization', `Bearer ${authToken}`);

    const auditLog = await getAuditLog();
    expect(auditLog).toContainEqual(
      expect.objectContaining({
        action: 'PATIENT_DATA_ACCESS',
        userId: expect.any(Number),
        patientId: '1'
      })
    );
  });
});
```

### Medical Data Integrity Testing

```javascript
describe('Medical Data Integrity', () => {
  test('should validate medication dosages', () => {
    const invalidDosage = { medication: 'Aspirin', dosage: '10g' };
    const validDosage = { medication: 'Aspirin', dosage: '100mg' };

    expect(() => validateMedication(invalidDosage)).toThrow();
    expect(() => validateMedication(validDosage)).not.toThrow();
  });

  test('should prevent duplicate appointments', async () => {
    const appointmentData = {
      patientId: '1',
      date: '2025-07-20',
      time: '10:00',
      type: 'consultation'
    };

    // Create first appointment
    await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${authToken}`)
      .send(appointmentData);

    // Try to create duplicate
    const response = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${authToken}`)
      .send(appointmentData);

    expect(response.status).toBe(409);
  });
});
```

## Best Practices

### Test Organization

1. **Group Related Tests**: Use `describe` blocks to group related tests
2. **Clear Test Names**: Use descriptive test names that explain the scenario
3. **Single Responsibility**: Each test should test one specific behavior
4. **Independent Tests**: Tests should not depend on each other

### Test Data Management

```javascript
// Use factories for test data
const PatientFactory = {
  create: (overrides = {}) => ({
    name: 'John Doe',
    dateOfBirth: '1990-01-01',
    gender: 'male',
    contact: 'john@example.com',
    ...overrides
  })
};

// Use it in tests
const patient = PatientFactory.create({ name: 'Jane Doe' });
```

### Mocking External Services

```javascript
// Mock external API calls
jest.mock('../../src/services/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true })
}));

// Mock database calls
jest.mock('../../src/config/database', () => ({
  query: jest.fn().mockResolvedValue({ rows: [] })
}));
```

### Healthcare Testing Guidelines

1. **Test Edge Cases**: Medical scenarios often have edge cases
2. **Validate Data Integrity**: Ensure health data remains accurate
3. **Test Error Handling**: Medical systems must handle errors gracefully
4. **Performance Testing**: Healthcare systems need to be responsive
5. **Security Testing**: Patient data must be protected

## Common Test Patterns

### Testing Async Operations

```javascript
test('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

### Testing Error Conditions

```javascript
test('should handle database errors', async () => {
  // Mock database error
  jest.spyOn(db, 'query').mockRejectedValue(new Error('Database error'));
  
  await expect(getPatient(1)).rejects.toThrow('Database error');
});
```

### Testing Authentication

```javascript
test('should require authentication', async () => {
  const response = await request(app)
    .get('/api/patients')
    .expect(401);
    
  expect(response.body.message).toBe('Access Denied: No token provided.');
});
```

## Troubleshooting Tests

### Common Issues

1. **Database Connection**: Ensure test database is running
2. **Environment Variables**: Check test environment configuration
3. **Async Operations**: Use proper async/await patterns
4. **Test Isolation**: Ensure tests don't affect each other

### Debug Mode

```bash
# Run tests with debug output
DEBUG=* npm test

# Run single test with verbose output
npm test -- --verbose tests/unit/auth.test.js
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Healthcare Testing Best Practices](https://www.hipaajournal.com/healthcare-software-testing/)
- [HIPAA Testing Guidelines](https://www.hhs.gov/hipaa/for-professionals/security/guidance/guidance-materials/index.html)

---

Remember: In healthcare technology, thorough testing isn't just about code quality—it's about patient safety and trust. Test comprehensively, test often, and always consider the healthcare context of your features.

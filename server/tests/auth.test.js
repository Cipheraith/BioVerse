const request = require('supertest');
const app = require('../app');

describe('Authentication', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        dob: '1990-01-01',
        nationalId: 'test12345'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('User registered successfully.');
      expect(response.body.token).toBeDefined();
    });

    it('should not register user with existing email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        dob: '1990-01-01',
        nationalId: 'test12345'
      };

      await request(app).post('/api/auth/register').send(userData);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.message).toBe('User already exists.');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        dob: '1990-01-01',
        nationalId: 'test12345'
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should not login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials.');
    });
  });

  describe('JWT Token Validation', () => {
    it('should validate valid JWT token', async () => {
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          dob: '1990-01-01',
          nationalId: 'test12345'
        });

      const token = registerResponse.body.token;

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should reject invalid JWT token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(403);

      expect(response.body.message).toBe('Access Denied: Invalid token.');
    });
  });
});

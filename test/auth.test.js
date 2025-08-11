const request = require('supertest');
const app = require('../server');  // Correct import path for server.js

describe('API tests', () => {
  // Test valid login for user
  it('should log in user successfully and redirect to /user', async () => {
    const response = await request(app)
      .post('/login')
      .type('form')
      .send({ username: 'alice', password: 'password123' });
    
    // The user should be redirected to '/user' after login
    expect(response.status).toBe(302);
    expect(response.header.location).toBe('/user');
  });

  // Test invalid login (wrong credentials)
  it('should return 401 for invalid login', async () => {
    const response = await request(app)
      .post('/login')
      .type('form')
      .send({ username: 'alice', password: 'wrongpassword' });
    
    expect(response.status).toBe(401);
    expect(response.text).toBe('Invalid credentials');
  });

  // Test valid login for admin
  it('should log in admin successfully and redirect to /admin', async () => {
    const response = await request(app)
      .post('/login')
      .type('form')
      .send({ username: 'bob', password: 'password456' });
    
    // The admin should be redirected to '/admin'
    expect(response.status).toBe(302);
    expect(response.header.location).toBe('/admin');
  });

});
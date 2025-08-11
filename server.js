const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// users db
const users = [
  {
    username: 'alice',
    password: 'password123',
    role: 'user',
  },
  {
    username: 'bob',
    password: 'password456',
    role: 'admin',
  },
];

// Middleware to parse session data
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
}));

app.use((req, _res, next) => {
  req.user = req.session.user || null;
  next();
});

// Auth and Role Check Functions
function ensureAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).send('Unauthorized');  // 401 for unauthorized users
  }
  next();
}

function ensureRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).send('Forbidden');  // 403 for forbidden access
    }
    next();
  };
}

// Parse URL-encoded bodies (form submissions)
app.use(express.urlencoded({ extended: true }));

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));

// 'login' handler
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);

  if (!user) return res.status(401).send('Invalid credentials');
  if (password !== user.password) return res.status(401).send('Invalid credentials');
  
  // Set session after successful login
  req.session.user = { username: user.username, role: user.role };

  // Redirect based on user role
  console.log(`User ${username} logged in with role ${user.role}`);  // Debug log
  res.redirect(user.role === 'admin' ? '/admin' : '/user');
});

// Routes
app.get('/user', ensureAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'user.html'));
});

app.get('/admin', ensureAuth, ensureRole('admin'), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = app;  // Export the app for testing

// Only start the server if this file is run directly (not imported)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
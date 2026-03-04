const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Set timezone to Toronto, Canada (EST/EDT)
process.env.TZ = 'America/Toronto';

const app = express();

// MongoDB connection cache
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }
  
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI not defined');
      return;
    }
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

// Middleware - apply BEFORE routes
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Connect to DB middleware - before routes
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../server/uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Delore server is running!' });
});

// Routes
app.use('/api/review-access', require('../server/routes/review'));
app.use('/api/auth', require('../server/routes/auth'));
app.use('/api/documents', require('../server/routes/documents'));
app.use('/api/tasks', require('../server/routes/tasks'));
app.use('/api/payments', require('../server/routes/payments'));
app.use('/api/messages', require('../server/routes/messages'));
app.use('/api/admin', require('../server/routes/admin'));
app.use('/api/clients', require('../server/routes/clients'));
app.use('/api/leave-requests', require('../server/routes/leaveRequests'));
app.use('/api/reports', require('../server/routes/reports'));
app.use('/api/users', require('../server/routes/admin'));

// Handle 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Export for Vercel serverless function
module.exports = app;

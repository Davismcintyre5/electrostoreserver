require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
const setupSocket = require('./utils/socket');
const { PORT } = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Allowed origins for CORS
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  process.env.ADMIN_URL || 'http://localhost:3001',
];

// CORS middleware for Express
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Body parser
app.use(express.json());

// Static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ==================== BASIC INFO ENDPOINTS ====================
app.get('/', (req, res) => {
  res.json({ message: 'ElectroStore Server Running' });
});

app.get('/api', (req, res) => {
  res.json({ 
    message: 'ElectroStore API', 
    endpoints: [
      '/api/auth',
      '/api/admin',
      '/api/customer',
      '/api/mpesa'
    ]
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ==================== API ROUTES ====================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/mpesa', require('./routes/mpesaRoutes'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/customer', require('./routes/customer'));

// Error handling middleware (must be last)
app.use(errorHandler);

// Setup Socket.IO
setupSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);
});
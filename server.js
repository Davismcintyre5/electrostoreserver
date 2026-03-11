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
  'http://localhost:3000',
  'http://localhost:3001',
  'https://electrostore.pxxl.click',
  'https://electrostore-admin.pxxl.click',
];

if (process.env.CLIENT_URL) allowedOrigins.push(process.env.CLIENT_URL);
if (process.env.ADMIN_URL) allowedOrigins.push(process.env.ADMIN_URL);

const uniqueOrigins = [...new Set(allowedOrigins)];

app.use(cors({
  origin: uniqueOrigins,
  credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Basic info endpoints
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

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/mpesa', require('./routes/mpesaRoutes'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/customer', require('./routes/customer'));

// Error handling
app.use(errorHandler);

// Socket.IO
setupSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Allowed CORS origins: ${uniqueOrigins.join(', ')}`);
});
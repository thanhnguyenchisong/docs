const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// --- Middleware ---
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// --- Routes ---
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// --- 404 ---
app.use((req, res) => {
  res.status(404).json({ success: false, error: { message: 'Route not found' } });
});

// --- Error handler ---
app.use(errorHandler);

module.exports = app;

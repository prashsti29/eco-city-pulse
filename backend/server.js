require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const mapRoutes = require('./routes/map.routes');

// Add this with your other route registrations
const app = express();

// CRITICAL: Middleware MUST come BEFORE routes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request logger to see what's happening
app.use((req, res, next) => {
  console.log(`\n📥 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Body:', req.body);
  console.log('Headers:', req.headers);
  next();
});

// Connect DB
connectDB();

// Initialize GEE in background (don't block)
const { initializeGEE } = require('./config/gee');
initializeGEE()
  .then(() => console.log('✓ GEE initialized successfully'))
  .catch(err => console.error('⚠️ GEE init failed:', err.message));

// Test route - BEFORE auth routes
app.get('/', (req, res) => {
  console.log('✓ Root endpoint hit');
  res.json({ 
    message: 'BGI Monitor API',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  console.log('✓ Health check');
  res.json({ status: 'ok' });
});

// AUTH ROUTES - Test endpoint first
app.post('/api/auth/test', (req, res) => {
  console.log('✓✓✓ TEST ENDPOINT HIT!');
  console.log('Received body:', req.body);
  res.json({ 
    success: true, 
    message: 'Test endpoint working!',
    receivedData: req.body 
  });
});

// Now load actual auth routes
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

// Other routes
app.use('/api/gee', require('./routes/gee.routes'));
app.use('/api/timeline', require('./routes/timeline.routes'));
app.use('/api/livability', require('./routes/livability.route'));
app.use('/api/resilience', require('./routes/uri.routes'));
app.use('/api/reports', require('./routes/reports.routes'));
app.use('/api/wards', require('./routes/ward.routes'));
app.use('/api/overview', require('./routes/overview.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/map', mapRoutes);

// 404 handler
app.use((req, res) => {
  console.log('❌ 404 - Route not found:', req.path);
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    path: req.path 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error caught:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5555;
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`Test: http://localhost:${PORT}/`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n⚠️ Shutting down gracefully...');
  process.exit(0);
});

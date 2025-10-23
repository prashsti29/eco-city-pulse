require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
// Add this with your other route imports
const uriRoutes = require('./routes/uri.routes');

// Add this with your other app.use() statements

// Connect DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));

// Test route
app.get('/', (req, res) => res.json({ message: 'BGI Monitor API' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✓ Server running on port ${PORT}`));
const { initializeGEE } = require('./config/gee');

// After connectDB(), add:
initializeGEE().catch(err => {
  console.error('GEE init failed:', err);
});

// Add route:
app.use('/api/gee', require('./routes/gee.routes'));
app.use('/api/timeline', require('./routes/timeline.routes'));
// Add with other routes
app.use('/api/livability', require('./routes/livability.route.js'));
app.use('/api/uri', uriRoutes);
const reportRoutes = require('./routes/reports.routes');
const wardRoutes = require('./routes/ward.routes');

app.use('/api/reports', reportRoutes);
app.use('/api/wards', wardRoutes);

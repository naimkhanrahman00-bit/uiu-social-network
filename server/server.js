const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');
const path = require('path');

// Load env vars
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
    res.send('UIU Social Network API is running...');
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const lostFoundRoutes = require('./routes/lostFoundRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/lost-found', lostFoundRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/settings', require('./routes/systemSettingsRoutes'));
app.use('/api/section-issue', require('./routes/sectionExchangeRoutes'));
app.use('/api/feedback', feedbackRoutes);
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

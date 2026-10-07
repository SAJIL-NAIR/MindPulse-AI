const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const authRoutes = require('./routes/auth');
const feedbackRoutes = require('./routes/feedback');
const reportRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 5000;
const corsOptions = process.env.CLIENT_ORIGIN
  ? {
      origin: (origin, callback) => {
        callback(null, !origin || origin === process.env.CLIENT_ORIGIN);
      }
    }
  : undefined;

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n🟢  Well-Being Pulse API running on port ${PORT}\n`);
});

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { analyzeSentiment, generateInsights } = require('../services/sentimentAnalyzer');
const { processEmployeeFeedback } = require('../services/burnoutCalculator');

const feedbackPath = path.join(__dirname, '..', 'data', 'feedback.json');

function readFeedback() {
  return JSON.parse(fs.readFileSync(feedbackPath, 'utf-8'));
}

function writeFeedback(data) {
  fs.writeFileSync(feedbackPath, JSON.stringify(data, null, 2), 'utf-8');
}

// Submit weekly feedback
router.post('/submit', (req, res) => {
  try {
    const { employeeId, emotionalState, stressLevel, workloadIntensity, customerDifficulty, textFeedback } = req.body;

    if (!employeeId || !emotionalState || stressLevel == null || workloadIntensity == null || customerDifficulty == null) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // AI Sentiment Analysis
    const sentimentResult = analyzeSentiment(textFeedback || '');

    // Burnout Calculation
    const { overallScore, burnoutRisk } = processEmployeeFeedback({
      stressLevel,
      workloadIntensity,
      customerDifficulty,
      sentimentResult
    });

    // Generate AI Insights
    const aiInsights = generateInsights(sentimentResult, stressLevel, workloadIntensity, burnoutRisk);

    // Get current Monday for "weekOf"
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const weekOf = monday.toISOString().split('T')[0];

    const newFeedback = {
      id: uuidv4(),
      employeeId,
      weekOf,
      emotionalState,
      stressLevel: Number(stressLevel),
      workloadIntensity: Number(workloadIntensity),
      customerDifficulty: Number(customerDifficulty),
      textFeedback: textFeedback || '',
      sentimentScore: sentimentResult.score,
      sentimentLabel: sentimentResult.label,
      overallScore,
      burnoutRisk,
      aiInsights
    };

    const allFeedback = readFeedback();
    allFeedback.push(newFeedback);
    writeFeedback(allFeedback);

    res.json({ success: true, feedback: newFeedback });
  } catch (err) {
    console.error('Error submitting feedback:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get feedback history for an employee
router.get('/my/:userId', (req, res) => {
  const allFeedback = readFeedback();
  const userFeedback = allFeedback
    .filter(f => f.employeeId === req.params.userId)
    .sort((a, b) => new Date(b.weekOf) - new Date(a.weekOf));
  res.json(userFeedback);
});

// Get latest feedback for an employee (current week)
router.get('/latest/:userId', (req, res) => {
  const allFeedback = readFeedback();
  const userFeedback = allFeedback
    .filter(f => f.employeeId === req.params.userId)
    .sort((a, b) => new Date(b.weekOf) - new Date(a.weekOf));
  res.json(userFeedback[0] || null);
});

module.exports = router;

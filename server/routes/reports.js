const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { getTeamAnalytics } = require('../services/burnoutCalculator');

const feedbackPath = path.join(__dirname, '..', 'data', 'feedback.json');
const usersPath = path.join(__dirname, '..', 'data', 'users.json');

function readFeedback() {
  return JSON.parse(fs.readFileSync(feedbackPath, 'utf-8'));
}

function readUsers() {
  return JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
}

// Employee personal report
router.get('/employee/:userId', (req, res) => {
  const allFeedback = readFeedback();
  const userFeedback = allFeedback
    .filter(f => f.employeeId === req.params.userId)
    .sort((a, b) => new Date(b.weekOf) - new Date(a.weekOf));

  if (userFeedback.length === 0) {
    return res.json({ hasData: false, message: 'No feedback submitted yet' });
  }

  const latest = userFeedback[0];
  const history = userFeedback.slice(0, 8); // Last 8 weeks

  // Calculate trend
  let stressTrend = 'stable';
  if (userFeedback.length >= 2) {
    const diff = latest.stressLevel - userFeedback[1].stressLevel;
    if (diff > 1) stressTrend = 'increasing';
    else if (diff < -1) stressTrend = 'decreasing';
  }

  res.json({
    hasData: true,
    latest,
    history,
    stressTrend,
    totalSubmissions: userFeedback.length
  });
});

// Manager team report
router.get('/manager/:managerId', (req, res) => {
  const users = readUsers();
  const allFeedback = readFeedback();

  // Get employees under this manager
  const teamMembers = users.filter(u => u.managerId === req.params.managerId);
  const teamIds = teamMembers.map(u => u.id);

  // Get latest feedback per employee (most recent weekOf)
  const latestByEmployee = {};
  allFeedback
    .filter(f => teamIds.includes(f.employeeId))
    .sort((a, b) => new Date(b.weekOf) - new Date(a.weekOf))
    .forEach(f => {
      if (!latestByEmployee[f.employeeId]) {
        latestByEmployee[f.employeeId] = f;
      }
    });

  const latestFeedbacks = Object.values(latestByEmployee);

  // Team analytics
  const analytics = getTeamAnalytics(latestFeedbacks);

  // Risk alerts (moderate + high risk employees)
  const riskAlerts = latestFeedbacks
    .filter(f => f.burnoutRisk === 'High' || f.burnoutRisk === 'Moderate')
    .map(f => {
      const emp = teamMembers.find(u => u.id === f.employeeId);
      return {
        ...f,
        employeeName: emp ? emp.name : 'Unknown',
        department: emp ? emp.department : 'Unknown'
      };
    })
    .sort((a, b) => b.overallScore - a.overallScore);

  // Weekly trend data (group all feedback by weekOf)
  const weeklyData = {};
  allFeedback
    .filter(f => teamIds.includes(f.employeeId))
    .forEach(f => {
      if (!weeklyData[f.weekOf]) {
        weeklyData[f.weekOf] = [];
      }
      weeklyData[f.weekOf].push(f);
    });

  const trends = Object.entries(weeklyData)
    .map(([week, entries]) => ({
      week,
      avgStress: parseFloat((entries.reduce((s, e) => s + e.stressLevel, 0) / entries.length).toFixed(1)),
      avgWorkload: parseFloat((entries.reduce((s, e) => s + e.workloadIntensity, 0) / entries.length).toFixed(1)),
      avgScore: Math.round(entries.reduce((s, e) => s + e.overallScore, 0) / entries.length),
      count: entries.length
    }))
    .sort((a, b) => new Date(a.week) - new Date(b.week));

  // Team member details with latest feedback
  const teamDetails = teamMembers.map(member => {
    const feedback = latestByEmployee[member.id];
    return {
      id: member.id,
      name: member.name,
      department: member.department,
      latestFeedback: feedback || null,
      burnoutRisk: feedback ? feedback.burnoutRisk : 'No Data',
      stressLevel: feedback ? feedback.stressLevel : null,
      overallScore: feedback ? feedback.overallScore : null
    };
  });

  res.json({
    analytics,
    riskAlerts,
    trends,
    teamDetails,
    teamSize: teamMembers.length
  });
});

module.exports = router;

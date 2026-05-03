/**
 * Burnout Risk Calculator
 * Computes overall well-being scores and classifies burnout risk levels.
 */

const WEIGHTS = {
  stressLevel: 0.40,
  workloadIntensity: 0.30,
  customerDifficulty: 0.20,
  sentimentPenalty: 0.10
};

function calculateOverallScore(stressLevel, workloadIntensity, customerDifficulty, sentimentScore) {
  // Convert each metric to a 0-100 scale (from 1-10 input)
  const stressNorm = (stressLevel / 10) * 100;
  const workloadNorm = (workloadIntensity / 10) * 100;
  const difficultyNorm = (customerDifficulty / 10) * 100;

  // Sentiment penalty: negative sentiment adds to score, positive reduces it
  // sentimentScore ranges from -1 to 1, we convert to 0-100 (inverted)
  const sentimentNorm = ((1 - sentimentScore) / 2) * 100;

  const overallScore =
    WEIGHTS.stressLevel * stressNorm +
    WEIGHTS.workloadIntensity * workloadNorm +
    WEIGHTS.customerDifficulty * difficultyNorm +
    WEIGHTS.sentimentPenalty * sentimentNorm;

  return Math.round(overallScore);
}

function classifyBurnoutRisk(overallScore, stressLevel, sentimentLabel) {
  // High risk: score > 70, OR (negative sentiment AND high stress)
  if (overallScore > 70) return 'High';
  if (sentimentLabel === 'Negative' && stressLevel >= 7) return 'High';

  // Moderate risk: score 45-70
  if (overallScore >= 45) return 'Moderate';

  // Low risk
  return 'Low';
}

function processEmployeeFeedback(data) {
  const { stressLevel, workloadIntensity, customerDifficulty, sentimentResult } = data;

  const overallScore = calculateOverallScore(
    stressLevel,
    workloadIntensity,
    customerDifficulty,
    sentimentResult.score
  );

  const burnoutRisk = classifyBurnoutRisk(overallScore, stressLevel, sentimentResult.label);

  return {
    overallScore,
    burnoutRisk
  };
}

function getTeamAnalytics(feedbackEntries) {
  if (!feedbackEntries || feedbackEntries.length === 0) {
    return {
      avgStress: 0,
      avgWorkload: 0,
      avgScore: 0,
      riskDistribution: { Low: 0, Moderate: 0, High: 0 },
      totalEmployees: 0
    };
  }

  const totalEmployees = feedbackEntries.length;
  const avgStress = feedbackEntries.reduce((s, f) => s + f.stressLevel, 0) / totalEmployees;
  const avgWorkload = feedbackEntries.reduce((s, f) => s + f.workloadIntensity, 0) / totalEmployees;
  const avgScore = feedbackEntries.reduce((s, f) => s + f.overallScore, 0) / totalEmployees;

  const riskDistribution = { Low: 0, Moderate: 0, High: 0 };
  feedbackEntries.forEach(f => {
    riskDistribution[f.burnoutRisk] = (riskDistribution[f.burnoutRisk] || 0) + 1;
  });

  return {
    avgStress: parseFloat(avgStress.toFixed(1)),
    avgWorkload: parseFloat(avgWorkload.toFixed(1)),
    avgScore: Math.round(avgScore),
    riskDistribution,
    totalEmployees
  };
}

module.exports = { calculateOverallScore, classifyBurnoutRisk, processEmployeeFeedback, getTeamAnalytics };

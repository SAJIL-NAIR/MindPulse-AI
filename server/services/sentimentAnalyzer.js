/**
 * AI Sentiment Analyzer
 * Keyword-based NLP engine for analyzing employee feedback text.
 */

const positiveWords = {
  'great': 0.6, 'good': 0.5, 'wonderful': 0.8, 'excellent': 0.9, 'happy': 0.7,
  'fantastic': 0.85, 'amazing': 0.85, 'love': 0.7, 'enjoy': 0.6, 'productive': 0.6,
  'motivated': 0.7, 'appreciated': 0.65, 'smooth': 0.5, 'efficient': 0.6, 'positive': 0.6,
  'satisfied': 0.6, 'confident': 0.65, 'inspired': 0.7, 'collaboration': 0.5, 'support': 0.3,
  'resolved': 0.4, 'accomplished': 0.6, 'comfortable': 0.5, 'balanced': 0.5, 'thriving': 0.8,
  'rewarding': 0.7, 'exciting': 0.65, 'proud': 0.6, 'cheerful': 0.7, 'optimistic': 0.65,
  'calm': 0.5, 'relaxed': 0.5, 'energized': 0.6, 'grateful': 0.6, 'helpful': 0.5,
  'better': 0.3, 'improved': 0.4, 'success': 0.6, 'achievement': 0.6, 'well': 0.3
};

const negativeWords = {
  'stressed': -0.7, 'overwhelmed': -0.8, 'frustrated': -0.75, 'anxious': -0.65,
  'tired': -0.5, 'exhausted': -0.8, 'angry': -0.7, 'terrible': -0.85, 'awful': -0.85,
  'drained': -0.7, 'difficult': -0.4, 'tough': -0.4, 'pressure': -0.5, 'burnout': -0.9,
  'burning': -0.6, 'dread': -0.8, 'overworked': -0.75, 'unhappy': -0.7, 'miserable': -0.85,
  'struggling': -0.6, 'worried': -0.55, 'upset': -0.6, 'disappointing': -0.6, 'failing': -0.7,
  'unrealistic': -0.5, 'unsupported': -0.6, 'isolated': -0.65, 'hopeless': -0.9,
  'demotivated': -0.7, 'confusion': -0.4, 'chaos': -0.7, 'conflict': -0.5, 'negative': -0.5,
  'hate': -0.8, 'boring': -0.4, 'pointless': -0.6, 'toll': -0.5, 'bad': -0.5, 'worst': -0.8,
  'escalation': -0.4, 'escalations': -0.4, 'complaint': -0.4, 'complaints': -0.4
};

const intensifiers = {
  'very': 1.3, 'extremely': 1.5, 'really': 1.2, 'absolutely': 1.4, 'incredibly': 1.4,
  'quite': 1.1, 'highly': 1.3, 'so': 1.2, 'too': 1.2, 'completely': 1.4, 'totally': 1.3,
  'constantly': 1.2, 'never': 1.3, 'always': 1.1, 'badly': 1.3
};

const negators = ['not', 'no', 'never', "don't", "doesn't", "didn't", "isn't", "aren't", "wasn't", "weren't", "can't", "couldn't", "shouldn't", "won't"];

function analyzeSentiment(text) {
  if (!text || text.trim().length === 0) {
    return { score: 0, label: 'Neutral', confidence: 0 };
  }

  const words = text.toLowerCase().replace(/[^\w\s']/g, '').split(/\s+/);
  let totalScore = 0;
  let wordCount = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let wordScore = 0;

    if (positiveWords[word] !== undefined) {
      wordScore = positiveWords[word];
    } else if (negativeWords[word] !== undefined) {
      wordScore = negativeWords[word];
    } else {
      continue;
    }

    // Check for intensifiers before the word
    if (i > 0 && intensifiers[words[i - 1]]) {
      wordScore *= intensifiers[words[i - 1]];
    }

    // Check for negators within 3 words before
    for (let j = Math.max(0, i - 3); j < i; j++) {
      if (negators.includes(words[j])) {
        wordScore *= -0.75;
        break;
      }
    }

    totalScore += wordScore;
    wordCount++;
  }

  const rawScore = wordCount > 0 ? totalScore / wordCount : 0;
  // Clamp between -1 and 1
  const score = Math.max(-1, Math.min(1, rawScore));

  let label;
  if (score > 0.2) label = 'Positive';
  else if (score < -0.2) label = 'Negative';
  else label = 'Neutral';

  const confidence = Math.min(1, wordCount / 5);

  return { score: parseFloat(score.toFixed(2)), label, confidence: parseFloat(confidence.toFixed(2)) };
}

function generateInsights(sentimentResult, stressLevel, workloadIntensity, burnoutRisk) {
  const insights = [];

  if (burnoutRisk === 'High') {
    insights.push('⚠️ Your burnout risk is high this week. Please consider speaking with your manager or HR for support.');
    if (stressLevel >= 8) {
      insights.push('Your stress level was very elevated. Try scheduling short 5-minute breaks between tasks to decompress.');
    }
    if (workloadIntensity >= 8) {
      insights.push('Your workload intensity is concerning. Discuss task redistribution with your team lead.');
    }
    insights.push('Consider utilizing employee assistance programs or wellness resources available to you.');
  } else if (burnoutRisk === 'Moderate') {
    insights.push('You are in a moderate stress zone. Stay mindful of any upward trends in the coming weeks.');
    if (stressLevel >= 6) {
      insights.push('Consider prioritizing your top 3 tasks each morning to reduce the feeling of being overwhelmed.');
    }
    insights.push('Taking a proper lunch break away from your desk can help recharge your energy.');
  } else {
    insights.push('Great job maintaining healthy stress levels! Keep up the excellent work.');
    if (sentimentResult.label === 'Positive') {
      insights.push('Your positive attitude is a strength — consider mentoring colleagues who may be struggling.');
    }
    insights.push('Continue maintaining your current work-life balance routine.');
  }

  return insights;
}

module.exports = { analyzeSentiment, generateInsights };

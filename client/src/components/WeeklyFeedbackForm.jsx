import { useState } from 'react';
import axios from 'axios';
import { API } from '../api';

const emotions = [
  { value: 'happy', emoji: '😊', label: 'Happy' },
  { value: 'content', emoji: '🙂', label: 'Content' },
  { value: 'neutral', emoji: '😐', label: 'Neutral' },
  { value: 'tired', emoji: '😴', label: 'Tired' },
  { value: 'anxious', emoji: '😰', label: 'Anxious' },
  { value: 'stressed', emoji: '😫', label: 'Stressed' },
  { value: 'frustrated', emoji: '😤', label: 'Frustrated' },
  { value: 'sad', emoji: '😢', label: 'Sad' },
];

export default function WeeklyFeedbackForm({ userId, onSubmitSuccess }) {
  const [emotionalState, setEmotionalState] = useState('');
  const [stressLevel, setStressLevel] = useState(5);
  const [workloadIntensity, setWorkloadIntensity] = useState(5);
  const [customerDifficulty, setCustomerDifficulty] = useState(5);
  const [textFeedback, setTextFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const getSliderColor = (value) => {
    if (value <= 3) return 'var(--accent-teal)';
    if (value <= 6) return 'var(--accent-amber)';
    return 'var(--accent-coral)';
  };

  const getSliderBg = (value) => {
    const pct = ((value - 1) / 9) * 100;
    const color = getSliderColor(value);
    return `linear-gradient(to right, ${color} ${pct}%, hsla(220, 15%, 25%, 0.5) ${pct}%)`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emotionalState) return;

    setSubmitting(true);
    try {
      const res = await axios.post(`${API}/feedback/submit`, {
        employeeId: userId,
        emotionalState,
        stressLevel,
        workloadIntensity,
        customerDifficulty,
        textFeedback
      });

      if (res.data.success) {
        setSubmittedData(res.data.feedback);
        setShowSuccess(true);
      }
    } catch (err) {
      console.error('Error submitting:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDismissSuccess = () => {
    setShowSuccess(false);
    if (onSubmitSuccess) onSubmitSuccess(submittedData);
  };

  return (
    <>
      <form onSubmit={handleSubmit} id="feedback-form">
        {/* Emotional State */}
        <div className="form-group animate-slide-up stagger-1">
          <label className="form-label">How did you feel this week? *</label>
          <div className="emotion-grid">
            {emotions.map((em) => (
              <button
                type="button"
                key={em.value}
                className={`emotion-btn ${emotionalState === em.value ? 'selected' : ''}`}
                onClick={() => setEmotionalState(em.value)}
              >
                <span className="emotion-emoji">{em.emoji}</span>
                <span className="emotion-label">{em.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Stress Level */}
        <div className="form-group animate-slide-up stagger-2">
          <div className="slider-container">
            <div className="slider-header">
              <label className="form-label" style={{ marginBottom: 0 }}>Stress Level</label>
              <span className="slider-value" style={{ color: getSliderColor(stressLevel) }}>{stressLevel}</span>
            </div>
            <input
              type="range"
              className="form-range"
              min="1"
              max="10"
              value={stressLevel}
              onChange={(e) => setStressLevel(Number(e.target.value))}
              style={{ background: getSliderBg(stressLevel) }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </div>

        {/* Workload Intensity */}
        <div className="form-group animate-slide-up stagger-3">
          <div className="slider-container">
            <div className="slider-header">
              <label className="form-label" style={{ marginBottom: 0 }}>Workload Intensity</label>
              <span className="slider-value" style={{ color: getSliderColor(workloadIntensity) }}>{workloadIntensity}</span>
            </div>
            <input
              type="range"
              className="form-range"
              min="1"
              max="10"
              value={workloadIntensity}
              onChange={(e) => setWorkloadIntensity(Number(e.target.value))}
              style={{ background: getSliderBg(workloadIntensity) }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
              <span>Light</span>
              <span>Heavy</span>
            </div>
          </div>
        </div>

        {/* Customer Difficulty */}
        <div className="form-group animate-slide-up stagger-4">
          <div className="slider-container">
            <div className="slider-header">
              <label className="form-label" style={{ marginBottom: 0 }}>Customer Interaction Difficulty</label>
              <span className="slider-value" style={{ color: getSliderColor(customerDifficulty) }}>{customerDifficulty}</span>
            </div>
            <input
              type="range"
              className="form-range"
              min="1"
              max="10"
              value={customerDifficulty}
              onChange={(e) => setCustomerDifficulty(Number(e.target.value))}
              style={{ background: getSliderBg(customerDifficulty) }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
              <span>Easy</span>
              <span>Difficult</span>
            </div>
          </div>
        </div>

        {/* Text Feedback */}
        <div className="form-group animate-slide-up stagger-5">
          <label className="form-label">Describe your week (optional)</label>
          <textarea
            id="text-feedback"
            className="form-textarea"
            placeholder="Share your experience this week... What went well? What was challenging? How are you feeling overall?"
            value={textFeedback}
            onChange={(e) => setTextFeedback(e.target.value)}
          />
        </div>

        <button
          id="submit-feedback-btn"
          type="submit"
          className="btn btn-primary btn-lg"
          style={{ width: '100%', marginTop: 'var(--space-4)' }}
          disabled={!emotionalState || submitting}
        >
          {submitting ? '⏳ Analyzing your feedback...' : '🚀 Submit Weekly Feedback'}
        </button>
      </form>

      {/* Success Overlay */}
      {showSuccess && submittedData && (
        <div className="success-overlay" onClick={handleDismissSuccess}>
          <div className="success-card" onClick={(e) => e.stopPropagation()}>
            <div className="success-icon">✅</div>
            <h3>Feedback Submitted!</h3>
            <p>Your weekly well-being data has been analyzed by our AI engine.</p>

            <div style={{ textAlign: 'left', marginBottom: 'var(--space-6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>Sentiment</span>
                <span className={`badge badge-${submittedData.sentimentLabel.toLowerCase()}`}>
                  {submittedData.sentimentLabel}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>Burnout Risk</span>
                <span className={`badge badge-${submittedData.burnoutRisk.toLowerCase()}`}>
                  {submittedData.burnoutRisk}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>Overall Score</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{submittedData.overallScore}/100</span>
              </div>
            </div>

            <button className="btn btn-primary" onClick={handleDismissSuccess}>
              View Full Report →
            </button>
          </div>
        </div>
      )}
    </>
  );
}

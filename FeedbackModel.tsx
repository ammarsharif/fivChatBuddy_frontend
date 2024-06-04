import React from 'react';
import './stylesFeedbackModel.css';

const FeedbackModel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="feedback-container">
      <h2>Feedback</h2>
      <p>We would love to hear your feedback...</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default FeedbackModel;

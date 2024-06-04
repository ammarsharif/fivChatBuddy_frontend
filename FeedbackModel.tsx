import React from 'react';
import { IoMdArrowRoundBack } from 'react-icons/io';
import './stylesFeedbackModel.css';

const FeedbackModel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="feedback-container">
       <button className="back-button" onClick={onClose}>
        <IoMdArrowRoundBack />
      </button>
      <h2>Feedback</h2>
      <p>We would love to hear your feedback...</p>
    </div>
  );
};

export default FeedbackModel;

import React, { useState } from 'react';
import { IoMdArrowRoundBack } from 'react-icons/io';
import emailjs from 'emailjs-com';
import '../styles/stylesFeedbackModel.css';

interface FeedbackModelProps {
  onBack: () => void;
}

const FeedbackModel: React.FC<FeedbackModelProps> = ({ onBack }) => {
  const [name, setName] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const sendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const templateParams = {
      name,
      feedback,
    };

    emailjs
      .send(
        'service_d2qjxj',
        'template_l9ipj9v',
        templateParams,
        'PV02uSJkTcSgE5AIf'
      )
      .then((response) => {
        alert('SUCCESS!! ' + response.status);
        setName('');
        setFeedback('');
      })
      .catch((err) => {
        console.log('FAILED...', err);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <>
      <button className="back-button" onClick={onBack}>
        <IoMdArrowRoundBack />
      </button>
      <div className="feedback-container">
        <h2>Feedback</h2>
        <p>Provide your feedback here.</p>
        <form onSubmit={sendFeedback}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="input-field"
          />
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Your feedback"
            required
            className="textarea-field"
          />
          <button type="submit" className="submit-button" disabled={submitting}>
            {submitting ? 'Sending...' : 'Send Feedback'}
          </button>
        </form>
      </div>
    </>
  );
};

export default FeedbackModel;

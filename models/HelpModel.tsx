import React from 'react';
import { IoMdArrowRoundBack } from 'react-icons/io';
import '../styles/stylesHelpModel.css';

interface HelpModelProps {
  onClose: () => void;
}

const HelpModel: React.FC<HelpModelProps> = ({ onClose }) => {
  return (
    <div className="help-model-wrapper">
      <button className="back-button" onClick={onClose}>
        <IoMdArrowRoundBack />
      </button>
      <div className="model-container">
        <h2>Help Center</h2>
        <p className="intro-text">
          Welcome to our chat suggestion extension! Here's how to get started:
        </p>

        <div className="step">
          <h3>Step 1: Sign In</h3>
          <p>
            First, sign in using your Google account. This will authenticate you
            and allow you to access the chat suggestion features.
          </p>
        </div>

        <div className="step">
          <h3>Step 2: Button Appearance</h3>
          <p>
            Once signed in, you'll notice a new button appearing in your chat
            box. This button is your gateway to suggested replies.
          </p>
        </div>

        <div className="step">
          <h3>Step 3: Open the Suggestion Module</h3>
          <p>
            Click the button to open a small module that suggests replies you
            can give to other users. The module offers several features to
            tailor your responses.
          </p>
        </div>

        <div className="step">
          <h3>Step 4: Select Your Role</h3>
          <p>
            Choose whether you are a seller or a buyer. This helps the system
            provide more relevant suggestions based on your role.
          </p>
        </div>

        <div className="step">
          <h3>Step 5: Choose a Tone</h3>
          <p>
            Select the tone in which you want your reply to be. Available tones
            might include friendly, professional, casual, and more.
          </p>
        </div>

        <div className="step">
          <h3>Step 6: Suggested Replies</h3>
          <p>
            The module will display the three most related replies. You can
            choose any of them by clicking the "Paste" button, and the reply
            will be directly pasted into your typing space.
          </p>
        </div>

        <div className="step">
          <h3>Step 7: Reload Suggestions</h3>
          <p>
            If you don't like any of the suggested replies, click the "Reload"
            button to get another set of three most related replies.
          </p>
        </div>

        <div className="additional-tips">
          <h3>Additional Tips</h3>
          <ul>
            <li>Ensure you're signed in to access all features.</li>
            <li>
              Use the tone selector to better match your communication style.
            </li>
            <li>
              Reload suggestions if the initial ones don't fit your needs.
            </li>
          </ul>
        </div>

        <p className="closing-text">
          We hope you find this tool helpful for your communications. If you
          have any questions, feel free to reach out to our support team.
        </p>
      </div>
    </div>
  );
};

export default HelpModel;

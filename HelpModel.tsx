import React from 'react';
import { IoMdArrowRoundBack } from 'react-icons/io';
import './stylesHelpModel.css';

const HelpModel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="help-container">
      <button className="back-button" onClick={onClose}>
        <IoMdArrowRoundBack />
      </button>
      <h2>Help</h2>
      <p>Here you can find some helpful information...</p>
    </div>
  );
};

export default HelpModel;

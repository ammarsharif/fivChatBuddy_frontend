import React from 'react';
import './stylesHelpModel.css';

const HelpModel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="help-container">
      <h2>Help</h2>
      <p>Here you can find some helpful information...</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default HelpModel;

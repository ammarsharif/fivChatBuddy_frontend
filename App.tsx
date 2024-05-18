import React from "react";

function App() {
  const onButtonClick = async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id || 0, '');
  };

  return (
    <div style={{ padding: '1em' , margin:'1em'}}>
      <div>
        <h3>Add Button to Webpage</h3>
        <button onClick={onButtonClick} style={{
            padding: '10px 30px',
            backgroundColor:'#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            outline: 'none',
          }}>Add Button</button>
      </div>
    </div>
  );
}

export default App;



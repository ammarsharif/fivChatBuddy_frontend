import React, { useEffect } from 'react';
import { getAuthToken } from './background';

function App() {
  const containerStyle = {
    backgroundColor: '#fffff',
    padding: '20px',
    width: '325px',
    margin: '-12px',
    fontFamily: 'Arial, sans-serif',
  };

  const headingStyle = {
    color: '#333',
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
    marginTop: '10px',
    marginLeft: '12px',
  };

  const header = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
  };

  const logoHeader = {
    display: 'flex',
    alignItems: 'center',
  };

  const headDivider = {
    width: '100%',
    border: 'none',
    borderBottom: '1px solid #ccc',
    margin: '18px 0px 6px 0px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  };

  const onButtonClick = async () => {
    try {
      const token = await getAuthToken();
      const tabs = await chrome?.tabs?.query({
        active: true,
        currentWindow: true,
      });
      console.log('Tabs:', tabs);
      if (Array.isArray(tabs) && tabs.length > 0) {
        const activeTab = tabs[0];
        console.log('Active Tab:', activeTab);
        const fiverrPattern = /^https:\/\/www\.fiverr\.com\/.*$/;

        if (activeTab.url && fiverrPattern.test(activeTab.url)) {
          chrome.tabs.sendMessage(activeTab.id || 0, '');
          setTimeout(() => {
            chrome.tabs.sendMessage(activeTab.id || 0, {
              action: 'openUserProfile',
              token: token,
            });
          }, 300);
        } else {
          const newUrl = chrome.runtime.getURL('tabInfoModel.html');
          chrome.tabs.create({ url: newUrl }, (newTab) => {
            chrome.tabs.onUpdated.addListener(function listener(
              tabId,
              changeInfo
            ) {
              if (tabId === newTab?.id && changeInfo.status === 'complete') {
                chrome.tabs.onUpdated.removeListener(listener);
                chrome.tabs.sendMessage(tabId, {
                  action: 'showUserProfile',
                  token: token,
                });
              }
            });
          });
        }
      } else {
        console.error('No active tab found');
      }
    } catch (error) {
      console.error('Error getting auth token or querying tabs: ', error);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={header}>
        <div style={logoHeader}>
          <img
            src="https://logos-world.net/wp-content/uploads/2020/12/Fiverr-Logo.png"
            width={'43px'}
            height={'24px'}
            style={{ borderRadius: '50%' }}
          ></img>
          <p style={headingStyle}>Fiverr</p>
        </div>
        <button
          onClick={onButtonClick}
          style={{
            padding: '10px 30px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          See Profile
        </button>
      </div>
      <hr style={headDivider} />
    </div>
  );
}

export default App;

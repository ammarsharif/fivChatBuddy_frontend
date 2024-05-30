import React, { useEffect, useState, useRef } from 'react';
import { getAuthToken } from './background';
import './stylesApp.css';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [responseText, setResponseText] = useState(null);
  const [loading, setLoading] = useState<boolean>(false);
  const useRefState = useRef(false);

  useEffect(() => {
    useRefState.current = true;
    if (!authenticated) {
      generateResponse();
    }
    return () => {
      useRefState.current = false;
    };
  }, []);

  const generateResponse = async () => {
    try {
      const token = await getAuthToken();
      setLoading(true);
      const response = await fetchProfileInfo(token);
      if (useRefState.current) {
        setAuthenticated(true);
        setResponseText(response.photos?.[0]?.url || 'default-photo-url');
      }
    } catch (error) {
      if (useRefState.current) {
        setAuthenticated(false);
      }
      console.error('Error fetching profile info:', error);
    } finally {
      if (useRefState.current) {
        setLoading(false);
      }
    }
  };

  const fetchProfileInfo = async (token: string | undefined) => {
    const response = await fetch(
      'https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  };

  const onProfileHandler = async () => {
    try {
      const token = await getAuthToken();
      const tabs = await chrome?.tabs?.query({
        active: true,
        currentWindow: true,
      });
      if (Array.isArray(tabs) && tabs.length > 0) {
        const activeTab = tabs[0];
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

  const onGoogleButtonHandler = () => {
    generateResponse();
  };

  const deleteTokenHandler = async () => {
    try {
      const token = await getAuthToken(false);
      if (token) {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
        chrome.identity.removeCachedAuthToken({ token }, () => {
          setAuthenticated(false);
          setResponseText(null);
          console.log('Token revoked and deleted');
        });
      } else {
        console.log('No token found.');
      }
    } catch (error) {
      console.error('Error revoking token:', error);
    }
  };

  return (
    <div className="container">
      {loading ? (
        <div className="spinner"></div>
      ) : (
        <>
          <div className="header">
            <div className="logo-header">
              <img
                src="https://logos-world.net/wp-content/uploads/2020/12/Fiverr-Logo.png"
                width={'43px'}
                height={'24px'}
                style={{ borderRadius: '50%' }}
                alt="EvolveBay Logo"
              />
              <p className="heading">Fiverr</p>
            </div>
            {authenticated ? (
              <>
                <img
                  src={responseText || 'default-photo-url'}
                  alt="Profile"
                  className="user-pic"
                  onClick={onProfileHandler}
                />
                <button onClick={deleteTokenHandler} className="delete-button">
                  Delete Token
                </button>
              </>
            ) : (
              <button onClick={onGoogleButtonHandler} className="google-button">
                <img
                  src="https://www.freepnglogos.com/uploads/google-logo-png/google-logo-png-webinar-optimizing-for-success-google-business-webinar-13.png"
                  alt="Google Logo"
                  className="google-logo"
                />
                Login Google
              </button>
            )}
          </div>
          <hr className="head-divider" />
        </>
      )}
    </div>
  );
}

const spinnerStyle = `
.spinner {
  border: 3px solid rgba(255, 0, 0, 0.3);
  border-radius: 50%;
  border-top: 3px solid #87150b;
  width: 2em;
  height: 2em;
  animation: spin 1s linear infinite;
  margin: 4em auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
`;

const styleElement = document.createElement('style');
styleElement.innerHTML = spinnerStyle;
document.head.appendChild(styleElement);

export default App;

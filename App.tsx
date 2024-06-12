import React, { useEffect, useState, useRef } from 'react';
import { getAuthToken } from './background';
import { RiQuestionMark } from 'react-icons/ri';
import { MdOutlineFeedback } from 'react-icons/md';
import HelpModel from './models/HelpModel';
import FeedbackModel from './models/FeedbackModel';
import './styles/stylesApp.css';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [responseText, setResponseText] = useState(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeModule, setActiveModule] = useState<string | null>(null);
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
    const profileInfo = await response.json();
    await fetch(`${process.env.FIV_CHAT_API_BASE_URL}api/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileInfo),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return profileInfo;
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

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'Help':
        return <HelpModel onClose={() => setActiveModule(null)} />;
      case 'Feedback':
        return <FeedbackModel onClose={() => setActiveModule(null)} />;
      default:
        return renderMainPopup();
    }
  };

  const renderMainPopup = () => {
    return (
      <>
        <div className="header">
          <div className="logo-header">
            <img
              src="icons/logo_white.png"
              width={'40px'}
              height={'35px'}
              style={{ borderRadius: '50%', marginRight: '0.5em' }}
              alt="EvolveBay Logo"
            />
            <p className="heading">Fiverr</p>
          </div>
          {authenticated ? (
            <img
              src={responseText || 'default-photo-url'}
              alt="Profile"
              className="user-pic"
              onClick={onProfileHandler}
            />
          ) : (
            <img
              src={
                'https://qph.cf2.quoracdn.net/main-qimg-f32f85d21d59a5540948c3bfbce52e68'
              }
              alt="Profile"
              className="user-pic"
            />
          )}
        </div>
        <hr className="head-divider" />
        {authenticated ? (
          <div>
            <div className="table-container">
              <div className="table-row">
                <button
                  className="table-cell"
                  onClick={() => setActiveModule('Help')}
                >
                  <span role="img" aria-label="help" className="icon">
                    <RiQuestionMark />
                  </span>
                  Need Help
                </button>
              </div>
              <div className="table-row">
                <button
                  className="table-cell"
                  onClick={() => setActiveModule('Feedback')}
                >
                  <span role="img" aria-label="feedback" className="icon">
                    <MdOutlineFeedback />
                  </span>
                  Provide Feedback
                </button>
              </div>
            </div>
            <button onClick={deleteTokenHandler} className="logout-button">
              Logout
            </button>
          </div>
        ) : (
          <div>
            <h3 style={{ marginTop: '1em' }}>Sign in to unlock the magic</h3>
            <button onClick={onGoogleButtonHandler} className="google-button">
              <img
                src="https://www.freepnglogos.com/uploads/google-logo-png/google-logo-png-webinar-optimizing-for-success-google-business-webinar-13.png"
                alt="Google Logo"
                className="google-logo"
              />
              Sign in with Google
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="container">
      {loading ? <div className="spinner"></div> : renderActiveModule()}
    </div>
  );
}

export default App;

import React, { useEffect, useState, useRef } from 'react';
import './stylesTabUserProfile.css';
import { getAuthToken } from './background';
interface ProfileInfo {
  names?: { displayName: string }[];
  emailAddresses?: { value: string }[];
  photos?: { url: string }[];
}
const TabUserProfile: React.FC = () => {
  const [responseText, setResponseText] = useState<ProfileInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const useRefState = useRef(false);

  useEffect(() => {
    console.log('CONSOLING FROM PROFILE');

    generateResponse();
    const messageListener = (message: any) => {
      useRefState.current = true;
      console.log(useRefState, 'USE REF STATE:::::');
    };
    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const generateResponse = async () => {
    const token = await getAuthToken();
    try {
      setLoading(true);
      const response = await fetch(
        `https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const profileInfo = await response.json();
      console.log(profileInfo);
      const backendResponse = await fetch('http://localhost:5000/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileInfo),
      });
  
      if (backendResponse.ok) {
        console.log('Profile data sent to the backend');
      } else {
        console.error('Error sending profile data to the backend');
      }
      setResponseText(profileInfo);
    } catch (error) {
      console.error('Error fetching profile info:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-container">
      <div className="container">
        <div className="header">
          <div className="logo-header">
            <img
              src="https://media.licdn.com/dms/image/D4D0BAQGd8H31h5niqg/company-logo_200_200/0/1712309492132/evolvebay_logo?e=2147483647&v=beta&t=tSYT6EkXf7aP709xw1DbPc41AbobGq6qtM5PC1El__I"
              height="32px"
              width="32px"
              style={{ borderRadius: '50%' }}
            />
            <p className="heading">User Profile</p>
          </div>
        </div>
        <hr className="head-divider" />
        <div className="content-container">
          {loading ? (
            <div className="spinner"></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {responseText ? (
                <div className="user-profile-container">
                  <div className="user-info">
                    <p className="user-name">
                      Name:{' '}
                      {responseText.names?.[0]?.displayName ||
                        'No display name available'}
                    </p>
                    <p className="user-email">
                      Email:{' '}
                      {responseText.emailAddresses?.[0]?.value ||
                        'No email available'}
                    </p>
                  </div>
                  <img
                    src={responseText.photos?.[0]?.url || 'default-photo-url'}
                    alt="Profile"
                    className="user-pic"
                  />
                </div>
              ) : (
                <p className="no-profile">No Profile Available</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const spinnerStyle = `
.spinner {
  border: 3px solid rgba(255, 0, 0, 0.3);
  border-radius: 50%;
  border-top: 3px solid #87150b;
  width: 6em;
  height: 6em;
  animation: spin 1s linear infinite;
  margin: 5em auto;
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

export default TabUserProfile;

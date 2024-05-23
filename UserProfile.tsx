import React, { useEffect, useState, useRef } from 'react';
import { getAuthToken } from './background';
import './stylesUserProfile.css';
interface ProfileInfo {
  names?: { displayName: string }[];
  emailAddresses?: { value: string }[];
  photos?: { url: string }[];
}
const UserProfile: React.FC = () => {
  const [responseText, setResponseText] = useState<ProfileInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const useRefState = useRef(false);

  const LoadingChatBubble = ({ size }) => {
    const bubbleStyle = {
      width: size === 'large' ? '85%' : '60%',
      height: '25px',
      margin: '10px 0',
      borderRadius: '10px',
      backgroundColor: '#f3f3f3',
      animation: 'pulse 1.5s ease-in-out infinite',
    };

    return <div style={bubbleStyle}></div>;
  };

  useEffect(() => {
    console.log('CONSOLING FROM PROFILE');

    generateResponse();
    const messageListener = (message: any) => {
      console.log(useRefState, 'USE REF STATE:::::');
      useRefState.current = true;
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

  const handleCloseButton = () => {
    useRefState.current = false;
    chrome.runtime.sendMessage({ action: 'closeIframe' });
  };

  return (
    <div className="container">
      <div>
        <div className="header">
          <div className="logo-header">
            <img
              src="https://logos-world.net/wp-content/uploads/2020/12/Fiverr-Logo.png"
              width="43px"
              height="24px"
              style={{ borderRadius: '50%' }}
            />
            <p className="heading">User Profile</p>
          </div>
          <div className="tone-header">
            <button
              className="close-button"
              onClick={handleCloseButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ffecec';
                e.currentTarget.style.borderRadius = '50%';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
              }}
            >
              &#x2715;
            </button>
          </div>
        </div>
        <hr className="head-divider" />
        <div>
          {loading ? (
            <div>
              <LoadingChatBubble size="large" />
              <LoadingChatBubble size="small" />
              <LoadingChatBubble size="large" />
              <LoadingChatBubble size="small" />
              <LoadingChatBubble size="small" />
              <LoadingChatBubble size="large" />
            </div>
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

export default UserProfile;

import React, { useState, useRef } from 'react';
import '../styles/stylesAuthModel.css';
import { getAuthToken } from '../background';

const AuthModel: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const useRefState = useRef(false);

  const LoadingChatBubble: React.FC<{ size: 'large' | 'small' }> = ({
    size,
  }) => {
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

  const generateResponse = async () => {
    try {
      const token = await getAuthToken();
      setLoading(true);
      await fetchProfileInfo(token);
    } catch (error) {
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

  const handleGoogleButton = async () => {
    await generateResponse();
    setTimeout(() => {
      chrome.runtime.sendMessage({ action: 'closeIframe' });
    }, 1000);
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
              width="45px"
              height="25px"
              alt="FivChat Logo"
              style={{ borderRadius: '50%' }}
            />
            <p className="heading">Sign In</p>
          </div>
          <div className="tone-header">
            <button
              className="close-button"
              onClick={handleCloseButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1dbf73';
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
        <div className="container-google">
          {loading ? (
            <div>
              <LoadingChatBubble size="large" />
              <LoadingChatBubble size="small" />
              <LoadingChatBubble size="large" />
              <LoadingChatBubble size="small" />
              <LoadingChatBubble size="small" />
            </div>
          ) : (
            <>
              <h2>Sign in to unlock the magic</h2>
              <button onClick={handleGoogleButton} className="google-button">
                <img
                  src="https://www.freepnglogos.com/uploads/google-logo-png/google-logo-png-webinar-optimizing-for-success-google-business-webinar-13.png"
                  alt="Google Logo"
                  className="google-logo"
                />
                Sign in with Google
              </button>
              <p style={{ margin: '5px' }}>
                By clicking “Connect with Google” you agree
              </p>
              <p style={{ margin: '0px' }}>
                to the{' '}
                <a href="/terms-of-use" className="link-underline">
                  Terms of Use
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModel;

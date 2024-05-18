import React, { ChangeEvent, useEffect, useState } from 'react';


const EmailSuggestions: React.FC = () => {
  
  const containerStyle = {
    backgroundColor: '#f7f7f7',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '20px',
    width: '265px',
    height: '100%',
    margin: '-12px',
    paddingBottom: '100px',
    fontFamily: 'Arial, sans-serif',
  };

  const headingStyle = {
    color: '#333',
    fontSize: '24px',
    marginBottom: '10px',
  };

  const paragraphStyle = {
    color: '#666',
  };

  const selectStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    marginTop: '10px',
  };
  const responseItemStyle = {
    cursor: 'pointer',
    padding: '8px',
    marginBottom: '2px',
    backgroundColor: '#eaeaea',
    borderRadius: '4px',
  };

  const closeButton = {
    backgroundColor: '#ccc',
    color: '#333',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    marginBottom: '20px',
    cursor: 'pointer',
  };
  

  const [responseText, setResponseText] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<string>('professional');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const messageListener = (message: any) => {
      if (message.action === 'receiveEmailText') {
        const emailText = message?.response;
        const modifiedEmailText = emailText?.replace(
          'professional',
          selectedTone
        );
        if (modifiedEmailText && modifiedEmailText.includes(selectedTone)) {
          generateResponse(modifiedEmailText);
        }
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, [selectedTone]);

  const handleToneChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const tone = event.target.value;
    setSelectedTone(tone);
    chrome.runtime.sendMessage({ action: 'generateEmailText' });
  };

  const generateResponse = async (modifiedEmailText: string) => {
    try {
      setLoading(true);
      console.log(
        'Generating Response of ' + modifiedEmailText + '. Please wait...'
      );
      const response = await fetch('https://chatgpt-42.p.rapidapi.com/gpt4', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Key':
            '01d3db204bmshd41c53a6ae8a9d6p15c871jsned9d98a1c36e',
          'X-RapidAPI-Host': 'chatgpt-42.p.rapidapi.com',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: modifiedEmailText,
            },
          ],
          web_access: false,
        }),
      });

      const data = await response.json();
      if (data.result) {
        console.log(data.result, 'API response DATA contain result');
        setResponseText(data.result);
      } else {
        console.log('API response does not contain result');
        return null;
      }
    } catch (error) {
      console.error('Error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const replyDiv = document.querySelector('.response');
    if (replyDiv && responseText) {
      replyDiv.innerHTML = responseText;
    }
  }, [responseText]);

  const handleResponseClick = (response: string) => {
    chrome.runtime.sendMessage({
      action: 'suggestedText',
      suggestion: response,
    });
    console.log(response);
  };

  const handleCloseButton = () => {
    chrome.runtime.sendMessage({ action: 'closeIframe' });
  };

  return (
    <div style={containerStyle}>
      <button
        className="close_button"
        style={closeButton}
        onClick={() => handleCloseButton()}
      >
        Close
      </button>
      <h1 style={headingStyle}>Select Email Tone</h1>
      <p style={paragraphStyle}>Please select the tone of your email reply:</p>
      <select id="toneSelect" style={selectStyle} onChange={handleToneChange}>
        <option value="not_interested">Not Interested</option>
        <option value="professional">Professional</option>
        <option value="impower">Impower</option>
        <option value="attractive">Attractive</option>
      </select>
      <div>
        <p style={{ ...paragraphStyle, marginTop: '20px' }}>
          Select a response:
        </p>
        {loading ? (
          <div className="spinner"></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <p
              style={{ ...responseItemStyle, backgroundColor: '#f0f0f0' }}
              onClick={() =>
                handleResponseClick(responseText || 'No response available')
              }
            >
              {responseText || 'No response available'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};



const spinnerStyle = `
.spinner {
  border: 3px solid rgba(255, 0, 0, 0.3); /* Red border */
  border-radius: 50%;
  border-top: 3px solid #87150b;
  width: 15px;
  height: 15px;
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

export default EmailSuggestions;
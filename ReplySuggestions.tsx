import React, { ChangeEvent, useEffect, useState } from 'react';

const ReplySuggestions: React.FC = () => {
  const containerStyle = {
    backgroundColor: '#f7f7f7',
    padding: '20px',
    width: '350px',
    margin: '-12px',
    paddingBottom: '22em',
    fontFamily: 'Arial, sans-serif',
  };

  const headingStyle = {
    color: '#333',
    fontSize: '17px',
    fontWeight: 'bold',
    margin: '10px 5px 10px -2px',
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

  const toneHeader = {
    display: 'flex',
  };

  const dividerStyle = {
    width: '100%',
    border: 'none',
    borderBottom: '1px solid #ccc',
    margin: '18px 0px 10px 0px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  };

  const selectContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    border: 'none',
    borderRadius: '5px',
    marginRight: '5px',
  };

  const selectStyle = {
    width: '100%',
    padding: '10px 0px 10px 6px',
    borderRadius: '10px',
    border: 'none',
    marginRight: '6px',
    backgroundColor: '#def8ff',
    fontSize: '15px',
    outline: 'none',
  };

  const responseItemStyle = {
    cursor: 'pointer',
    padding: '8px',
    marginBottom: '2px',
    backgroundColor: '#eaeaea',
    borderRadius: '4px',
    lineHeight: '1.5',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    transition: 'background-color 0.3s ease',
  };

  const closeButton = {
    marginTop: '0px',
    height: '25px',
    fontSize: '20px',
    color: '#a5a5a5',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
  };

  const [responseText, setResponseText] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<string>('formal');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const messageListener = (message: any) => {
      if (message.action === 'receiveEmailText') {
        const emailText = `Act as a content creation consultant to assist the seller in crafting reply messages. Here is the messages...\n ${message?.response}\n So as you see each message should conclude by specifying whether it is from the seller or the buyer and your  task is to help the seller respond to the buyer's messages efficiently and attractively, maintaining an formal tone for the situation\n make sure the answer should be short in length not more than 20 words as this is chat not an email so i want reply in short and perfect according to given situation\nRemember that don't add the extra lines like here is your text or any warm regard or any thing that usedd to be in bracker like [seller] or any other this just give to the point text so I can just copy and paste it right`;
        const modifiedEmailText = emailText?.replace('formal', selectedTone);
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
            '198bada44amshd95219dc04db750p14af07jsne52453168165-123',
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
    console.log(replyDiv,'REply, ', responseText);
    
    if (replyDiv && responseText) {
      replyDiv.innerHTML = responseText;
    }
  }, [responseText]);

  const handleResponseClick = (response: string) => {
    if (response !== undefined) {
      chrome.runtime.sendMessage({
        action: 'suggestedText',
        suggestion: response,
      });
      console.log(response);
    }
  };

  const handleCloseButton = () => {
    chrome.runtime.sendMessage({ action: 'closeIframe' });
  };

  return (
    <div
      style={{
        ...containerStyle,
      }}
    >
      <div>
        <div style={header}>
          <div style={logoHeader}>
            <img
              src="https://logos-world.net/wp-content/uploads/2020/12/Fiverr-Logo.png"
              height={'28px'}
              width={'50px'}
              style={{ borderRadius: '50%' }}
            ></img>
            <p style={headingStyle}>Suggestion...</p>
          </div>
          <div style={toneHeader}>
            <div style={selectContainerStyle}>
              <select
                id="toneSelect"
                style={{ ...selectStyle }}
                onChange={handleToneChange}
              >
                <option value="formal">👔 Formal</option>
                <option value="persuasive">🗣️ Persuasive</option>
                <option value="friendly">😊 Friendly</option>
                <option value="enthusiastic">🌟 Enthusiastic</option>
                <option value="empathetic">🤗 Empathetic</option>
                <option value="assertive">💪 Assertive</option>
                <option value="apologetic">🙏 Apologetic</option>
                <option value="informative">📘 Informative</option>
                <option value="reassuring">🤝 Reassuring</option>
                <option value="grateful">🙏 Grateful</option>
              </select>
            </div>
            <button
              className="close_button"
              style={closeButton}
              onClick={() => handleCloseButton()}
            >
              &#x2715;
            </button>
          </div>
        </div>
        <hr style={dividerStyle} />
        <div>
          {loading ? (
            <div className="spinner"></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <p
                style={{
                  ...responseItemStyle,
                  transition: 'background-color 0.3s ease',
                }}
                onClick={() =>
                  handleResponseClick(responseText || 'No response available')
                }
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f0f0f0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#e6e6e6';
                }}
              >
                {responseText || 'No response available'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const spinnerStyle = `
.spinner {
  border: 3px solid ##bfe29d;
  border-radius: 50%;
  border-top: 3px solid #1dbf73;
  width: 25px;
  height: 25px;
  animation: spin 1s linear infinite;
  margin: 11em auto;
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

export default ReplySuggestions;
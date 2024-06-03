import React, { ChangeEvent, useEffect, useState, useRef } from 'react';
import { RxCross1 } from 'react-icons/rx';
import { FaRegPaste } from 'react-icons/fa6';
import { TbReload } from 'react-icons/tb';

const ReplySuggestions: React.FC = () => {
  const containerStyle = {
    backgroundColor: '#fffff',
    padding: '20px',
    width: '350px',
    margin: '-12px',
    fontFamily: 'Arial, sans-serif',
  };

  const headingStyle = {
    color: '#333',
    fontSize: '17px',
    fontWeight: '600',
    margin: '10px 5px 10px -2px',
  };

  const header = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '2px',
  };

  const logoHeader = {
    display: 'flex',
    alignItems: 'center',
  };

  const toneHeader = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
  };

  const headDivider = {
    width: '97%',
    border: 'none',
    borderBottom: '1px solid #ccc',
    margin: '0px 0px 15px 0px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  };

  const replyDivider = {
    width: '100%',
    border: 'none',
    borderBottom: '1px solid #ccc',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  };

  const selectContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '10px',
    flex: '1',
  };

  const selectStyle = {
    width: '100%',
    padding: '8px 11px 8px 11px',
    borderRadius: '6px',
    border: 'none',
    margin: '0px',
    backgroundColor: '#F1F1F1',
    fontSize: '14px',
    outline: 'none',
    gap: '38px,',
  };

  const responseItemStyle = {
    padding: '2px 8px 0px',
    margin: '5px 0px',
    backgroundColor: '#fffff',
    borderRadius: '4px',
    lineHeight: '1.5',
    fontFamily: 'Arial, sans-serif',
    color: '#4d4d4d',
    fontSize: '14px',
    transition: 'background-color 0.3s ease',
  };
  const noResponseStyle = {
    padding: '0px 8px 0px',
    margin: '10px 0px',
    backgroundColor: '#fffff',
    borderRadius: '4px',
    lineHeight: '1.5',
    fontFamily: 'Arial, sans-serif',
    color: '#4d4d4d',
    fontSize: '16px',
    transition: 'background-color 0.3s ease',
  };

  const closeButton = {
    marginTop: '0px',
    width: '25px',
    height: '25px',
    fontSize: '14px',
    color: 'black',
    backgroundColor: 'transparent',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    paddingTop: '4px',
  };

  const reloadButtonStyle = {
    position: 'absolute',
    right: '1.3em',
    backgroundColor: '#1dbf73',
    border: 'none',
    borderRadius: '50%',
    width: '25px',
    height: '25px',
    color: 'white',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const copyIconStyle = {
    cursor: 'pointer',
    marginLeft: '10px',
    marginBottom: '4px',
    fontSize: '16px',
    width: '20px',
    height: '20px',
    border: 'none',
    borderRadius: '50%',
    padding: '5px 4px 5px 8px',
  };

  const [responseText, setResponseText] = useState<{ text: string }[] | null>(
    null
  );
  const [selectedTone, setSelectedTone] = useState<string>('formal');
  const [selectedRole, setSelectedRole] = useState<string>('seller');
  const [loading, setLoading] = useState<boolean>(true);
  const useRefState = useRef(false);

  useEffect(() => {
    const messageListener = (message: any) => {
      if (
        message.action == 'receiveEmailText' ||
        message.action == 'generateEmailText'
      ) {
        const emailText = `Act as a content creator consultant to assist me that I am ${selectedRole} and I have to deal with the ${
          selectedRole === 'seller' ? 'buyer' : 'seller'
        } in crafting reply messages. Here is the messages...\n ${
          message?.response
        }\n So as you see each message should conclude by specifying whether it is from the seller or the buyer and your  task is to help the ${selectedRole} respond to the ${
          selectedRole === 'seller' ? 'buyer' : 'seller'
        }'s messages efficiently and attractively, maintaining an formal tone for the situation\n make sure the answer should be short an perfect for situation not more than 25 words\nRemember that don't add the extra lines like here is your text or any warm regard or any thing that used to be in bracket like [seller] or any other this just give to the point text so I can just copy and paste it right\nalso while generating the response you have to generate only one response I need only one response and don't specify at the end that wether it is from [seller] or [buyer]\njust just give a reply in formal tone so i just copy and paste it right`;
        const modifiedEmailText = emailText?.replace('formal', selectedTone);
        if (modifiedEmailText && modifiedEmailText.includes(selectedTone)) {
          generateResponse(modifiedEmailText);
          useRefState.current = true;
        }
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, [selectedTone, selectedRole]);

  const handleToneChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const tone = event.target.value;
    setSelectedTone(tone);
    useRefState.current = false;
    chrome.runtime.sendMessage({ action: 'generateEmailText' });
  };
  const handleRoleChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const role = event.target.value;
    setSelectedRole(role);
    useRefState.current = false;
    chrome.runtime.sendMessage({ action: 'generateEmailText' });
  };

  const handleReloadClick = async () => {
    setLoading(true);
    useRefState.current = false;
    chrome.runtime.sendMessage({
      action: 'generateEmailText',
      selectedTone: selectedTone,
      selectedRole: selectedRole,
    });
  };

  const generateResponse = async (modifiedEmailText: string) => {
    try {
      setLoading(true);
      const fetchResponse = async () => {
        const response = await fetch(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              Authorization:
                'Bearer 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',
            },
            body: JSON.stringify({
              messages: [
                {
                  role: 'user',
                  content: modifiedEmailText,
                },
              ],
              model: 'openai/gpt-3.5-turbo',
              max_tokens: 200,
            }),
          }
        );
        const dataJson = await response.json();
        const choice = dataJson.choices[0];
        const responseContent = choice?.message.content;

        return responseContent ? { text: responseContent } : null;
      };
      const responses = await Promise.all([
        fetchResponse(),
        fetchResponse(),
        fetchResponse(),
      ]);
      const validResponses = responses.filter(
        (response) => response !== null
      ) as { text: string }[];

      if (validResponses.length === 3) {
        console.log(validResponses, 'VALID RESPONSE:::::');

        setResponseText(validResponses);
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

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
    useRefState.current = false;
    chrome.runtime.sendMessage({ action: 'closeIframe' });
  };

  return (
    <div
      style={{
        ...containerStyle,
        position: 'relative',
      }}
    >
      <div>
        <div style={header}>
          <div style={logoHeader}>
            <img
              src="https://logos-world.net/wp-content/uploads/2020/12/Fiverr-Logo.png"
              height={'24px'}
              width={'42px'}
              style={{ borderRadius: '50%' }}
            ></img>
            <p style={headingStyle}>A.I Suggested Replies</p>
          </div>
          <button
            className="close_button"
            style={closeButton}
            onClick={() => handleCloseButton()}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1dbf73';
              e.currentTarget.style.borderRadius = '50%';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
          >
            <RxCross1 />
          </button>
        </div>
        <hr style={headDivider} />
        <div style={toneHeader}>
          <div style={selectContainerStyle}>
            <select
              id="toneSelect"
              style={{ ...selectStyle }}
              onChange={handleToneChange}
            >
              <option value="formal">Formal</option>
              <option value="persuasive">Persuasive</option>
              <option value="friendly">Friendly</option>
              <option value="enthusiastic">Enthusiastic</option>
              <option value="empathetic">Empathetic</option>
              <option value="assertive">Assertive</option>
              <option value="apologetic">Apologetic</option>
              <option value="informative">Informative</option>
              <option value="reassuring">Reassuring</option>
              <option value="grateful">Grateful</option>
            </select>
          </div>
          <div style={selectContainerStyle}>
            <select
              id="roleSelect"
              style={{ ...selectStyle }}
              onChange={handleRoleChange}
            >
              <option value="seller">Seller</option>
              <option value="buyer">Buyer</option>
            </select>
          </div>
        </div>
        <div>
          {loading ? (
            <div className="spinner"></div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginTop: '10px',
              }}
            >
              {responseText ? (
                responseText.map((response, index) => (
                  <div key={index}>
                    <p
                      style={{
                        ...responseItemStyle,
                        transition: 'background-color 0.3s ease',
                      }}
                      onClick={() => handleResponseClick(response.text)}
                    >
                      {response.text}
                      {!loading ? (
                        <span
                          style={{ ...copyIconStyle, float: 'right' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResponseClick(response.text);
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#d1ffda';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#ffffff';
                          }}
                        >
                          <FaRegPaste />
                        </span>
                      ) : null}
                    </p>
                    {index < responseText.length - 1 && (
                      <hr style={replyDivider} />
                    )}
                  </div>
                ))
              ) : (
                <p
                  style={{
                    ...noResponseStyle,
                  }}
                >
                  No response available
                </p>
              )}
            </div>
          )}
          {!loading ? (
            <button
              style={{
                ...reloadButtonStyle,
                position: 'absolute',
                bottom: responseText ? '-1em' : '1.6em',
              }}
              onClick={handleReloadClick}
            >
              <TbReload />
            </button>
          ) : null}
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
  width: 7em;
  height: 7em;
  animation: spin 1s linear infinite;
  margin: 9.5em auto;
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

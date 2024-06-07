import React, { ChangeEvent, useEffect, useState, useRef } from 'react';
import { RxCross1 } from 'react-icons/rx';
import { FaRegPaste } from 'react-icons/fa6';
import { TbReload } from 'react-icons/tb';
import '../styles/stylesMainModel.css';

const MainModel: React.FC = () => {
  const [responseText, setResponseText] = useState<{ text: string }[] | null>(
    null
  );
  const [selectedTone, setSelectedTone] = useState<string>('formal');
  const [selectedRole, setSelectedRole] = useState<string>('seller');
  const [loading, setLoading] = useState<boolean>(true);
  const useRefState = useRef(false);

  useEffect(() => {
    const messageListener = (message: any) => {
      if (message.action === 'receiveEmailText') {
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
    chrome.runtime.sendMessage({ action: 'executeOnClicker' });
  };

  const handleRoleChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const role = event.target.value;
    setSelectedRole(role);
    useRefState.current = false;
    chrome.runtime.sendMessage({ action: 'executeOnClicker' });
  };

  const handleReloadClick = async () => {
    setLoading(true);
    useRefState.current = false;
    chrome.runtime.sendMessage({
      action: 'executeOnClicker',
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
              messages: [{ role: 'user', content: modifiedEmailText }],
              model: 'gryphe/mythomist-7b:free',
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
    <div className="container">
      <div>
        <div className="header">
          <div className="logoHeader">
            <img
              src="https://logos-world.net/wp-content/uploads/2020/12/Fiverr-Logo.png"
              height="24px"
              width="42px"
              style={{ borderRadius: '50%' }}
              alt="Fiverr Logo"
            ></img>
            <p className="heading">A.I Suggested Replies</p>
          </div>
          <button
            className="closeButton"
            onClick={handleCloseButton}
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
        <hr className="headDivider" />
        <div className="toneHeader">
          <div className="selectContainer">
            <select
              id="toneSelect"
              className="select"
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
          <div className="selectContainer">
            <select
              id="roleSelect"
              className="select"
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
                      className="responseItem"
                      onClick={() => handleResponseClick(response.text)}
                    >
                      {response.text}
                      {!loading ? (
                        <span
                          className="copyIcon"
                          style={{ float: 'right' }}
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
                      <hr className="replyDivider" />
                    )}
                  </div>
                ))
              ) : (
                <p className="noResponse">No response available</p>
              )}
            </div>
          )}
          {!loading ? (
            <button
              className="reloadButton"
              style={{ bottom: responseText ? '-1em' : '1.6em' }}
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

export default MainModel;

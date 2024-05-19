chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  chrome.tabs.query(
    { active: true, currentWindow: true },
    async function (tabs) {
      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });

        if (tab && tab.id) {
          const result = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: textFinder,
          });
          if (result && result[0] && result[0].result) {
            const emailText = result[0].result;
            console.log('Response is generating Please wait....');
            clickHandler(emailText);
          }
        } else {
          console.log('No active tab found');
        }
      } catch (error) {
        console.log('Error querying tabs:' + error);
      }
    }
  );
});

const textFinder = (): string | null => {
  const messageContents = document.querySelectorAll('.message-content');
  const resultArray: string[] = [];
  let messageCount = 0;

  const additionalTexts = document.querySelectorAll('.text.tbody-6.p-t-4');
  const additionalTextsLength = additionalTexts.length;
  const additionalTextsStartIndex = additionalTextsLength >= 7 ? additionalTextsLength - 7 : 0;

  for (let i = additionalTextsStartIndex; i < additionalTextsLength; i++) {
    const textContent = additionalTexts[i].textContent?.trim() ?? '';
    resultArray.push(`${textContent} (buyer)`);
    messageCount++;
  }

  const messageContentsLength = messageContents.length;
  const messageContentsStartIndex = messageContentsLength >= 7 ? messageContentsLength - 7 : 0;

  for (let i = messageContentsStartIndex; i < messageContentsLength; i++) {
    const content = messageContents[i];
    const senderElement = content.querySelector('[data-testid="basic-message-header"]');
    const role = senderElement ? 'buyer' : 'seller';

    const messageBody = content.querySelector('.message-body');
    if (messageBody) {
      const messageText = messageBody.textContent?.trim() ?? '';
      resultArray.push(`${messageText} (${role})`);
      messageCount++;
    }
  }

  const lastFourMessages = resultArray.slice(-4); // Selecting only the last four messages
  
  const combinedText = lastFourMessages.join('\n');
  console.log(combinedText, 'COMBINED TEXT :::::');

  return `Act as a content creation consultant to assist the seller in crafting reply messages. Here is the messages...\n ${combinedText}\n So as you see each message should conclude by specifying whether it is from the seller or the buyer and your  task is to help the seller respond to the buyer's messages efficiently and attractively, maintaining an formal tone for the situation\n make sure the answer should be short in length not too much big as this is chat not an email so i want reply in short and perfect according to given situation\nRemember that don't add the extra lines like here is your text or any warm regard or any thing that usedd to be in bracker like [seller] or any other this just give to the point text so I can just copy and paste it right`;
};

const clickHandler = async (emailText: any) => {
  try {
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
            content: emailText,
          },
        ],
        web_access: false,
      }),
    });

    const data = await response.json();
    if (data.result) {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const activeTab = tabs[0];
      if (activeTab && activeTab.id) {
        chrome.tabs.sendMessage(activeTab.id, { action: 'clickReplyButton' });
        chrome.tabs.sendMessage(activeTab.id, {
          action: 'setResponseInReplyInput',
          response: data.result,
        });
        chrome.tabs.sendMessage(activeTab.id, {
          action: 'receiveEmailText',
          response: emailText,
        });
      } else {
        console.log('No active tab found');
      }
    } else {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const activeTab = tabs[0];
      if (activeTab && activeTab.id) {
        chrome.tabs.sendMessage(activeTab.id, { action: 'clickReplyButton' });
        chrome.tabs.sendMessage(activeTab.id, {
          action: 'setResponseInReplyInput',
          response: data.result,
        });
        chrome.tabs.sendMessage(activeTab.id, {
          action: 'receiveEmailText',
          response: emailText,
        });
      } else {
        console.log('No active tab found');
      }
      console.log('API response does not contain result');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

chrome.runtime.onMessage.addListener(async function (
  message,
  sender,
  sendResponse
) {
  if (message.action === 'generateEmailText') {
    const suggestedText = message.selectedTone;
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    if (activeTab && activeTab.id) {
      chrome.tabs.sendMessage(activeTab.id, {
        action: 'generateEmailText',
        suggestedText: suggestedText,
      });
    }
  }
});

chrome.runtime.onMessage.addListener(async function (
  message,
  sender,
  sendResponse
) {
  if (message.action === 'suggestedText') {
    const suggestedText = message.suggestion;
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    if (activeTab && activeTab.id) {
      chrome.tabs.sendMessage(activeTab.id, {
        action: 'suggestedText',
        suggestedText: suggestedText,
      });
    }
  }
});

chrome.runtime.onMessage.addListener(async function (
  message,
  sender,
  sendResponse
) {
  if (message.action === 'closeIframe') {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    if (activeTab && activeTab.id) {
      chrome.tabs.sendMessage(activeTab.id, { action: 'closeIframe' });
    }
  }
});

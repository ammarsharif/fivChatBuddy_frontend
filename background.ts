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
  if (message.action === 'onClicker') {
  }
});

const textFinder = () => {
  const parentDiv = document.querySelector('.ii.gt') as HTMLElement | null;
  if (parentDiv) {
    const innerDiv = parentDiv.querySelector('.a3s.aiL') as HTMLElement | null;
    if (innerDiv) {
      const emailText = innerDiv.innerText.trim();
      return `Please add give a professional reply to this email and don't add prompt like here is you email and all stuff just give me the proper response in a good way \n ${emailText}`;
    } else {
      console.log('Inner div not found.');
    }
  } else {
    console.log('Parent div not found.');
  }
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

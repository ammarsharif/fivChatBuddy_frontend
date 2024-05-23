export async function getAuthToken(): Promise<string | undefined> {
  return new Promise((resolve) => {
    chrome?.identity?.getAuthToken(
      {
        interactive: true,
        scopes: [
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile',
        ],
      },
      (token) => {
        if (token) {
          console.log('Token:', token);
          resolve(token);
        } else {
          console.error('Error obtaining token:', chrome.runtime.lastError);
          resolve(undefined);
        }
      }
    );
  });
}

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
  const additionalTextsStartIndex =
    additionalTextsLength >= 10 ? additionalTextsLength - 10 : 0;

  for (let i = additionalTextsStartIndex; i < additionalTextsLength; i++) {
    const textContent = additionalTexts[i].textContent?.trim() ?? '';
    resultArray.push(`${textContent} (buyer)`);
    messageCount++;
  }

  const messageContentsLength = messageContents.length;
  const messageContentsStartIndex =
    messageContentsLength >= 10 ? messageContentsLength - 10 : 0;

  for (let i = messageContentsStartIndex; i < messageContentsLength; i++) {
    const content = messageContents[i];
    const senderElement = content.querySelector(
      '[data-testid="basic-message-header"]'
    );
    const role = senderElement ? 'buyer' : 'seller';

    const messageBody = content.querySelector('.message-body');
    if (messageBody) {
      const messageText = messageBody.textContent?.trim() ?? '';
      resultArray.push(`${messageText} (${role})`);
      messageCount++;
    }
  }

  const lastTenMessages = resultArray.slice(-10);

  const combinedText = lastTenMessages.join('\n');

  return combinedText;
};

const clickHandler = async (emailText: any) => {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  const activeTab = tabs[0];
  if (activeTab && activeTab.id) {
    chrome.tabs.sendMessage(activeTab.id, { action: 'clickReplyButton' });
setTimeout(() => {
  if (activeTab && activeTab.id)
  chrome.tabs.sendMessage(activeTab.id, {
    action: 'receiveEmailText',
    response: emailText,
  });
}, 300);
  } else {
    console.log('No active tab found');
  }
};

chrome.runtime.onMessage.addListener(async function (
  message,
  sender,
  sendResponse
) {
  if (message.action === 'generateEmailText') {
    const { selectedTone, selectedRole } = message;
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    if (activeTab && activeTab.id) {
      chrome.tabs.sendMessage(activeTab.id, {
        action: 'generateEmailText',
        selectedTone: selectedTone,
        selectedRole: selectedRole,
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

chrome.runtime.onMessage.addListener(async function (
  message,
  sender,
  sendResponse
) {
  if (message.action === 'authenticateWithGoogle') {
    const token = await getAuthToken();
    if (!chrome.runtime.lastError && token) {
      if (sender?.tab?.id)
        chrome.tabs.sendMessage(sender.tab.id, {
          action: 'handleAuthToken',
          token: token,
        });
    } else {
      console.error('Error obtaining token:', chrome.runtime.lastError);
    }
  }
});
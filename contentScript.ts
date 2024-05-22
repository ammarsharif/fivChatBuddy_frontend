let iframeExists = false;

const addButtonToPage = () => {
  const mainDiv = document.querySelector(
    '.message-action-bar .flex.flex-row.flex-items-center'
  );
  if (mainDiv) {
    if (!document.getElementById('myInjectButton')) {
      const button = document.createElement('img');
      button.src =
        'https://logos-world.net/wp-content/uploads/2020/12/Fiverr-Logo.png';
      button.alt = 'icon';
      button.id = 'myInjectButton';
      button.style.width = '43px';
      button.style.height = '24px';
      button.style.borderRadius = '50%';
      button.style.marginRight = '-30px';
      button.style.position = 'absolute';
      button.style.right = '6.5em';
      button.style.cursor = 'pointer';
      button.addEventListener('click', function () {
        iframeExists = false;
        chrome.runtime.sendMessage({ action: 'authenticateWithGoogle' });
        chrome.runtime.sendMessage({ action: 'executeOnClicker' });
      });
      mainDiv.appendChild(button);
    }
  }
};

window.onload = function () {
  setTimeout(() => {
    addButtonToPage();
  }, 500);
};

document.addEventListener('click', (event) => {
  console.log('BUTTON EXECUTED:::::::');
  setTimeout(() => {
    addButtonToPage();
  }, 500);
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'clickReplyButton') {
    const replyButton = document.querySelector(
      '.ams.bkH'
    ) as HTMLElement | null;
    if (replyButton) {
      replyButton.click();
    } else {
      if (!iframeExists) {
        const iframe = document.createElement('iframe');
        iframe.style.cssText = `
            position: fixed;
            top: 24em; 
            right: 3em; 
            width: 373px; 
            height: 438px;
            border: none;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.1);
            border-radius: 17px;
            z-index: 999999;
            background-color: white;
          `;
        iframe.src = chrome.runtime.getURL('iframe.html');
        document.body.appendChild(iframe);
        iframeExists = true;

        const closeListener = (
          message: { action: string },
          sender: any,
          sendResponse: any
        ) => {
          if (message.action === 'closeIframe') {
            if (iframe && iframe.parentNode) {
              iframe.parentNode.removeChild(iframe);
            }
          }
        };
        chrome.runtime.onMessage.addListener(closeListener);
      }
    }
  }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'handleAuthToken') {
    const { token } = message;
    console.log('Received token in content script:', token);
  }
});

let suggestedTextClicked = false;

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'suggestedText') {
    suggestedTextClicked = true;
    const textarea = document.getElementById(
      'message-box-text-area'
    ) as HTMLTextAreaElement;
    if (textarea) {
      textarea.value = message.suggestedText;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const ruler = document.querySelector('.ruler');
    if (ruler) {
      ruler.textContent = message.suggestedText;
    }
  }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'generateEmailText') {
    const emailText = message.emailText;
  }
});

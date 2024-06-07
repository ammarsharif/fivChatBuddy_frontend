import './styles/stylesContentScript.css';
let iframeExists = false;
let iUserProfile = false;

const checkAuthentication = async (): Promise<any> => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'checkAuthentication' });
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === 'authenticationStatus') {
        resolve(message);
      }
    });
  });
};

const showLoginButton = () => {
  const iframe = document.createElement('iframe');
  iframe.classList.add('custom-iframe');
  iframe.src = chrome.runtime.getURL('auth.html');
  document.body.appendChild(iframe);
  setTimeout(() => {
    iframe.classList.add('active');
  }, 10);
  iframeExists = true;

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'closeIframe') {
      if (iframe && iframe.parentNode) {
        iframe.classList.remove('active');
        setTimeout(() => {
          if (iframe && iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
            iframeExists = false;
          }
        }, 300);
      }
    }
  });
};

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (!iUserProfile) {
    if (msg.action === 'openUserProfile') {
      const iframe = document.createElement('iframe');
      iframe.classList.add('user-profile-iframe');
      iframe.src = chrome.runtime.getURL('infoModel.html');
      document.body.appendChild(iframe);
      setTimeout(() => {
        iframe.classList.add('active');
      }, 10);
      iUserProfile = true;
      const closeListener = (message: { action: string }) => {
        if (message.action === 'closeIframe') {
          if (iframe && iframe.parentNode) {
            iframe.classList.remove('active');
            setTimeout(() => {
              if (iframe && iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
                iUserProfile = false;
              }
            }, 300);
            iframeExists = false;
            iUserProfile = false;
          }
        }
      };
      chrome.runtime.onMessage.addListener(closeListener);
    }
  }
});

const addButtonToPage = () => {
  const mainDiv = document.querySelector(
    '.message-action-bar .flex.flex-row.flex-items-center'
  );

  if (mainDiv && !document.getElementById('myInjectButton')) {
    const button = document.createElement('img');
    button.src = chrome.runtime.getURL('icons/main_logo.png');
    button.alt = 'icon';
    button.id = 'myInjectButton';
    button.style.width = '27px';
    button.style.height = '24px';
    button.style.borderRadius = '50%';
    button.style.marginRight = '-30px';
    button.style.position = 'absolute';
    button.style.right = '6.5em';
    button.style.cursor = 'pointer';
    button.addEventListener('click', function () {
      checkAuthentication().then((response) => {
        if (response?.authenticated) {
          chrome.runtime.sendMessage({ action: 'clickReplyButton' });
          if (iframeExists) {
            chrome.runtime.sendMessage({ action: 'closeIframe' });
          } else {
            chrome.runtime.sendMessage({ action: 'receiveEmailText' });
            setTimeout(() => {
              chrome.runtime.sendMessage({ action: 'executeOnClicker' });
            }, 1000);
          }
        } else {
          if (iframeExists) {
            chrome.runtime.sendMessage({ action: 'closeIframe' });
          }
          showLoginButton();
        }
      });
    });
    mainDiv.appendChild(button);
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
    if (!iframeExists && !iUserProfile) {
      const iframe = document.createElement('iframe');
      iframe.classList.add('custom-iframe');
      iframe.src = chrome.runtime.getURL('iframe.html');
      document.body.appendChild(iframe);
      setTimeout(() => {
        iframe.classList.add('active');
      }, 10);
      iframeExists = true;

      const closeListener = (message: { action: string }) => {
        if (message.action === 'closeIframe') {
          if (iframe && iframe.parentNode) {
            iframe.classList.remove('active');
            setTimeout(() => {
              if (iframe && iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
                iframeExists = false;
              }
            }, 300);
            iframeExists = false;
          }
        }
      };
      chrome.runtime.onMessage.addListener(closeListener);
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
      textarea.value = message.suggestion;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const ruler = document.querySelector('.ruler');
    if (ruler) {
      ruler.textContent = message.suggestion;
    }
  }
});

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      addButtonToPage();
    }
  });
});

const config = { childList: true, subtree: true };
observer.observe(document.body, config);
const DEBUG = false;

async function waitForElement(parent, selector) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(function () {
      const element = parent.querySelector(selector);

      if (element) {
        if (DEBUG) {
          console.log(element);
        }
        clearInterval(interval);
        resolve(element);
      }
    }, 500);
  });
}

let scriptRunning = false;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "toggleScript") {
    scriptRunning = !scriptRunning;
    if (scriptRunning) {
      removeLimitation();
    } else {

    }
    sendResponse({ state: scriptRunning });
  }
});

const resetInputMaxLength = async () => {
  const mainHost = await waitForElement(document, ".cib-serp-main");
  const mainRoot = mainHost.shadowRoot;
  const actionHost = await waitForElement(mainRoot, "#cib-action-bar-main");
  const actionRoot = actionHost.shadowRoot;
  const inputHost = await waitForElement(actionRoot, "cib-text-input");
  const inputRoot = inputHost.shadowRoot;
  const searchInput = await waitForElement(inputRoot, "#searchbox");

  searchInput.maxLength = 999999999;

  let letterCounter = actionRoot.querySelector(".letter-counter");

  if (!letterCounter) {
    letterCounter = document.createElement('div');
    letterCounter.classList.add('letter-counter');
    letterCounter.style.color = '#1c4eee';
    letterCounter.style.fontWeight = 'bold';

    searchInput.parentNode.insertBefore(letterCounter, searchInput.nextSibling);
  }

  const characterCount = document.createElement('span');
  characterCount.classList.add('additional-message');
  characterCount.textContent = "  Limit removed ";
  characterCount.style.color = '#1c4eee';
  characterCount.style.fontWeight = 'bold';

  const countSpan = document.createElement('span');
  countSpan.classList.add('character-count');
  updateCharacterCount(searchInput.value, countSpan);

  countSpan.style.fontWeight = 'bold';
  countSpan.style.color = '#1c4eee';

  letterCounter.innerHTML = '';
  letterCounter.appendChild(countSpan);
  letterCounter.appendChild(characterCount);

  searchInput.addEventListener('input', () => {
    updateCharacterCount(searchInput.value, countSpan);
  });

  return searchInput;
};

function updateCharacterCount(value, element) {
  const count = value.length;
  element.textContent = `  Characters: ${count} `;
}

const removeLimitation = async () => {
  const searchInput = await resetInputMaxLength();
  console.log("  Character limit was removed.");

  const config = { attributes: true, childList: false, subtree: false };

  const callback = function (mutationsList, observer) {
    for (const mutation of mutationsList) {
      if (mutation.type === 'attributes') {
        searchInput.removeAttribute("maxlength");
        console.log('Attribute ' + mutation.attributeName + ' changed to: ' + searchInput.getAttribute(mutation.attributeName));
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(searchInput, config);

  function watchElementRemoved() {
    const interval = setInterval(function () {
      if (!searchInput.isConnected) {
        removeLimitation();
        observer.disconnect();
        clearInterval(interval);
      }
    }, 3000);
  }

  watchElementRemoved();
};
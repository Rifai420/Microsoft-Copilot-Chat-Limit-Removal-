document.addEventListener('DOMContentLoaded', function() {
  const toggleButton = document.getElementById('toggleButton');

  toggleButton.addEventListener('click', async function() {
    chrome.tabs.query({ active: true, currentWindow: true }, async function(tabs) {
      const tabId = tabs[0].id;
      chrome.tabs.sendMessage(tabId, { action: "toggleScript" }, function(response) {
        if (chrome.runtime.lastError) {

          const errorMessage = chrome.runtime.lastError.message;
          const connectionError = errorMessage.includes("Receiving end does not exist");

          if (connectionError) {

            showErrorInPopup("Script didn't load. Please open Copilot before running the extension.", false);
          } else {

            showErrorInPopup("An error occurred. Please try again.", false);
          }
        } else {

          if (response && response.state) {

            toggleButton.innerText = 'Stop';

            showErrorInPopup("Removed Successfully.", true); 

            closePopupAfterDelay();
          } else {

            showErrorInPopup("Script toggle failed. Please try again.", false);
          }
        }
      });
    });
  });


  function closePopupAfterDelay() {

    setTimeout(() => {
      window.close();
    }, 2000);
  }


  function showErrorInPopup(message, isSuccess) {
    const messageElement = document.createElement('p');
    messageElement.classList.add('text-sm', 'mt-2');
    
    if (isSuccess) {
      messageElement.classList.add('text-green-500');
    } else {
      messageElement.classList.add('text-red-500');
    }

    messageElement.textContent = message;

    const popupBody = document.querySelector('.p-5');
    popupBody.appendChild(messageElement);

    setTimeout(() => {
      messageElement.remove();
    }, 10000);
  }
});

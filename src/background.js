let isLimitRemoved = false;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'enable' && !isLimitRemoved) {
        toggleLimitation();
    } else if (request.action === 'disable' && isLimitRemoved) {
        toggleLimitation();
    }
});

async function toggleLimitation() {
    if (isLimitRemoved) {
        console.log("Character limit was already removed.");
    } else {
        const searchInput = await resetInputMaxLength();
        console.log("Character limit was removed.");
    }

    isLimitRemoved = !isLimitRemoved;
}

async function resetInputMaxLength() {

}

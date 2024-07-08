document.getElementById('start').addEventListener('click', () => {
  const urls = document.getElementById('urls').value.split('\n').filter(url => url.trim() !== '');
  chrome.runtime.sendMessage({ action: 'startProcessing', urls: urls });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'tasksCompleted') {
    document.getElementById('message').textContent = 'Tarea realizada con éxito';

    chrome.runtime.onInstalled.addListener(() => {
      chrome.notifications.create('end-notification', {
        type: 'basic',
        iconUrl: 'icon.png',
        title: 'Verification completed',
        message: 'LinkedIn verification is complete',
        priority: 2
      });
    });
    
  }
});

document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get('urls', function(data) {
    if (data.urls) {
      document.getElementById('urls').value = data.urls.join('\n');
    }
  });
});

document.getElementById('start').addEventListener('click', () => {
  const urls = document.getElementById('urls').value.split('\n').filter(url => url.trim() !== '');
  chrome.storage.local.set({ 'urls': urls }, function() {
    console.log('URLs saved');
    chrome.runtime.sendMessage({ action: 'startProcessing', urls: urls });
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'tasksCompleted') {
    document.getElementById('message').textContent = 'Tarea realizada con éxito';
  }
});

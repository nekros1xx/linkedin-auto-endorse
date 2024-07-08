chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startProcessing') {
    let urls = message.urls.map(normalizeUrl);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
      processUrls(urls, tabId);
    });
  } else if (message.action === 'continueProcessing') {
    processUrls(message.urls, message.tabId);
  } else if (message.action === 'tasksCompleted') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'Verification completed',
      message: 'LinkedIn verification is complete'
    });
  }
});

function normalizeUrl(url) {
  const baseUrls = ['https://www.linkedin.com/in/', 'https://linkedin.com/in/'];
  for (let baseUrl of baseUrls) {
    if (url.startsWith(baseUrl)) {
      const endIdx = url.indexOf('?');
      if (endIdx !== -1) {
        url = url.substring(0, endIdx);
      }
      if (!url.endsWith('/details/skills/')) {
        url = url.replace(/\/$/, '') + '/details/skills/';
      }
      return url;
    }
  }
  return url;
}

function processUrls(urls, tabId) {
  if (urls.length === 0) {
    console.log("Mostrando alerta de tarea completada");
    chrome.runtime.sendMessage({ action: 'tasksCompleted' });
    return;
  }

  const url = urls.shift();
  chrome.tabs.update(tabId, { url: url }, () => {
    chrome.tabs.onUpdated.addListener(function onUpdated(tabIdUpdated, changeInfo) {
      if (tabIdUpdated === tabId && changeInfo.status === 'complete') {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          function: simulatePageDownAndClick,
          args: [urls, tabId]
        });
        chrome.tabs.onUpdated.removeListener(onUpdated);
      }
    });
  });
}

function simulatePageDownAndClick(urls, tabId) {
  function pressPageDown(times, callback) {
    if (times > 0) {
      window.scrollBy(0, window.innerHeight);
      setTimeout(() => {
        pressPageDown(times - 1, callback);
      }, 200);
    } else {
      callback();
    }
  }

  pressPageDown(30, () => {
    var spans = document.querySelectorAll('span.artdeco-button__text');

    spans.forEach(function(span) {
      if (span.textContent.trim() === 'Endorse' || span.textContent.trim() === 'Validar') {
        span.click();
      }
    });

    setTimeout(() => {
      if (urls.length > 0) { // Solo continuar si aún hay URLs restantes
        chrome.runtime.sendMessage({ action: 'continueProcessing', urls: urls, tabId: tabId });
      } else {
        console.log("Procesamiento completado, mostrando alerta");

        chrome.runtime.sendMessage({ action: 'tasksCompleted' });
      }
    }, 2000);
  });
}

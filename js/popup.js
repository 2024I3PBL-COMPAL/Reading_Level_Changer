let readingLevel = 3;

document.getElementById("customRange1").addEventListener("input", (event) => {
  readingLevel = event.target.value;
  console.log("Reading level changed to:", readingLevel);
});

document.getElementById("convertButton").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        files: ["js/contents.js"],
      },
      () => {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "convertText",
          level: readingLevel,
        });
      }
    );
  });
});

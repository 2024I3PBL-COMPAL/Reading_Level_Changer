chrome.runtime.onInstalled.addListener(() => {
  console.log("Easy Text Converter installed.");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const GoogleAPIKey = "SECRET";

  if (message.action === "simplifyText") {
    console.log(message.level);
    let targetText = "";

    if (message.level === 1) {
      targetText = "kindergartner who Learning English for the first time";
    } else if (message.level === 2) {
      targetText = "middle school students";
    } else if (message.level === 3) {
      targetText = "adult";
    }

    fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GoogleAPIKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          system_instruction: {
            parts: {
              text: `From now on, change the words in the sentence that ${targetText} entered so that they can know. Don't add any other explanations. Just change the hard words and Maintain the entered language`,
            },
          },
          contents: {
            parts: {
              text: message.text.substr(0, 200),
            },
          },
          safety_settings: [
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_NONE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_NONE",
            },
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_NONE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_NONE",
            },
          ],
        }),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          sendResponse({
            simplifiedText: data.candidates[0].content.parts[0].text,
          });
        } else {
          console.error("Error: No results found in response.");
          sendResponse({
            simplifiedText: "Sorry, I couldn't simplify the text.",
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        sendResponse({
          simplifiedText:
            "Sorry, an error occurred while simplifying the text.",
        });
      });
    return true; // Will respond asynchronously.
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "convertText",
    title: "Change Reading Level Selected Text",
    contexts: ["selection"],
  });
  console.log("Easy Text Converter installed and context menu item added.");
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "convertText") {
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        function: getSelectedText,
      },
      (results) => {
        if (results && results[0] && results[0].result) {
          const selectedText = results[0].result;
          console.log("Selected text:", selectedText);
          chrome.storage.local.set({ selectedText: selectedText }, () => {
            chrome.windows.create({
              url: "main.html",
              type: "popup",
              width: 400,
              height: 300,
            });
          });
        }
      }
    );
  }
});

function getSelectedText() {
  return window.getSelection().toString();
}

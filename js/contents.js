chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "convertText") {
    let targetElement = document.getElementById("maincontent");
    console.log("Received message to convert text");

    if (window.location.toString().startsWith("https://n.news.naver.com/")) {
      targetElement = document.getElementById("title_area");
    }

    const bodyText = targetElement.innerText;
    console.log("Current body text:", bodyText);
    chrome.runtime.sendMessage(
      { action: "simplifyText", text: bodyText, level: message.level },
      (response) => {
        console.log("Received simplified text:", response.simplifiedText);
        targetElement.innerText = response.simplifiedText;
      }
    );
  } else if (message.action === "convertInlineText") {
    let targetElement = document.getElementById("maincontent");

    if (!targetElement) {
      targetElement = document.body;
    }

    console.log("Received message to convert text");

    const bodyText = message.text;
    console.log("Current body text:", bodyText);

    chrome.runtime.sendMessage(
      { action: "simplifyText", text: bodyText, level: message.level },
      (response) => {
        if (response && response.simplifiedText) {
          console.log("Received simplified text:", response.simplifiedText);

          // Inject iframe and display the result in it
          let iframe = document.createElement("iframe");
          iframe.src = chrome.runtime.getURL("main_inline.html");
          iframe.id = "simplifyIframe";
          iframe.style.position = "fixed";
          iframe.style.bottom = "0";
          iframe.style.left = "0";
          iframe.style.width = "100%";
          iframe.style.height = "100%";
          iframe.style.border = "none";
          iframe.style.zIndex = "9999";
          iframe.style.backgroundColor = "rgba(0, 0, 0, 0)";
          document.body.appendChild(iframe);

          iframe.onload = () => {
            iframe.contentWindow.postMessage(
              {
                action: "displayResult",
                simplifiedText: response.simplifiedText,
              },
              "*"
            );
          };
        } else {
          console.error("Failed to receive simplified text");
        }
      }
    );
  } else if (message.action === "reConvertInlineText") {
    const bodyText = message.text;
    console.log("Current body text:", bodyText);

    chrome.runtime.sendMessage(
      { action: "simplifyText", text: bodyText, level: message.level },
      (response) => {
        if (response && response.simplifiedText) {
          console.log("Received simplified text:", response.simplifiedText);

          let iframe = document.getElementById("simplifyIframe");

          iframe.contentWindow.postMessage(
            {
              action: "displayResult",
              simplifiedText: response.simplifiedText,
            },
            "*"
          );
        } else {
          console.error("Failed to receive simplified text");
        }
      }
    );
  }
});

window.addEventListener("message", (event) => {
  if (event.data.action === "closeIframe") {
    const iframe = document.getElementById("simplifyIframe");
    if (iframe) {
      iframe.remove();
    }
  }
});

function getSelectedText() {
  return window.getSelection().toString();
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getSelectedText") {
    sendResponse({ text: getSelectedText() });
  }
});

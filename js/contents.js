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
      { action: "simplifyText", text: bodyText },
      (response) => {
        console.log("Received simplified text:", response.simplifiedText);
        targetElement.innerText = response.simplifiedText;
      }
    );
  }
});

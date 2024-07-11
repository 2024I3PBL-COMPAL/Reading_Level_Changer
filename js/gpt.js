chrome.runtime.onInstalled.addListener(() => {
  console.log("Easy Text Converter installed.");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "simplifyText") {
    fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that simplifies text for a child.",
          },
          {
            role: "user",
            content: message.text,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.choices && data.choices.length > 0) {
          sendResponse({ simplifiedText: data.choices[0].text.trim() });
        } else {
          console.error("Error: No choices found in response.");
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

chrome.runtime.onInstalled.addListener(() => {
  console.log("Easy Text Converter installed.");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const GoogleAPIKey = "YourKey";

  if (message.action === "simplifyText") {
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
              text: "From now on, change the words in the sentence that elementary school students entered so that they can know. Don't add any other explanations. Just change the hard words",
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

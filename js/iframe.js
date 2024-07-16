window.addEventListener("message", (event) => {
  if (event.data.action === "displayResult") {
    const resultArea = document.getElementById("result-area");
    if (resultArea) {
      resultArea.innerText = event.data.simplifiedText;
    } else {
      console.error("Result area not found");
    }
  }
});

document.getElementById("closeButton").addEventListener("click", () => {
  window.parent.postMessage({ action: "closeIframe" }, "*");
});

const modalHeader = document.querySelector(".modal-header");
const modalDialog = document.querySelector(".modal-container");
let isDragging = false;
let mouseOffset = { x: 0, y: 0 };
let dialogOffset = { left: 0, right: 0 };

modalHeader.addEventListener("mousedown", function (event) {
  isDragging = true;
  mouseOffset = { x: event.clientX, y: event.clientY };
  dialogOffset = {
    left:
      modalDialog.style.left === ""
        ? 0
        : Number(modalDialog.style.left.replace("px", "")),
    right:
      modalDialog.style.top === ""
        ? 0
        : Number(modalDialog.style.top.replace("px", "")),
  };
});

document.addEventListener("mousemove", function (event) {
  if (!isDragging) {
    return;
  }
  let newX = event.clientX - mouseOffset.x;
  let newY = event.clientY - mouseOffset.y;

  modalDialog.style.left = `${dialogOffset.left + newX}px`;
  modalDialog.style.top = `${dialogOffset.right + newY}px`;
});

document.addEventListener("mouseup", function () {
  isDragging = false;
});

let readingLevel = 3;

document.getElementById("customRange1").addEventListener("input", (event) => {
  readingLevel = event.target.value;
  console.log("Reading level changed to:", readingLevel);
});

// document.getElementById("convertButton").addEventListener("click", () => {
//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     chrome.scripting.executeScript(
//       {
//         target: { tabId: tabs[0].id },
//         files: ["js/contents.js"],
//       },
//       (results) => {
//         if (results && results[0] && results[0].result) {
//           const selectedText = results[0].result;
//           console.log("Selected text:", selectedText);
//           chrome.tabs.sendMessage(tabs[0].id, {
//             action: "reConvertInlineText",
//             text: selectedText,
//             level: readingLevel,
//           });
//         }
//       }
//     );

//     // chrome.scripting.executeScript(
//     //   {
//     //     target: { tabId: tabs[0].id },
//     //     files: ["js/contents.js"],
//     //     function: getSelectedText,
//     //   },
//     //   () => {
//     //     chrome.tabs.sendMessage(tabs[0].id, {
//     //       action: "reConvertInlineText",
//     //       text: selectedText,
//     //       level: readingLevel,
//     //     });
//     //   }
//     // );
//   });
// });

// function getSelectedText() {
//   return window.getSelection().toString();
// }

document.getElementById("convertButton").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        files: ["js/contents.js"],
      },
      () => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "getSelectedText" },
          (response) => {
            if (response && response.text) {
              const selectedText = response.text;
              console.log("Selected text:", selectedText);
              chrome.tabs.sendMessage(tabs[0].id, {
                action: "reConvertInlineText",
                text: selectedText,
                level: readingLevel,
              });
            } else {
              console.error("No selected text found.");
            }
          }
        );
      }
    );
  });
});

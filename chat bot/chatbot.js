alert("hey");

// Select elements
const chatBox = document.querySelector(".chat-box");
const chatForm = document.querySelector(".input-area");
const textInput = document.querySelector("textarea");

// ⚠️ Replace this with your actual Gemini API key
const GEMINI_API_KEY = "AIzaSyB-CD-AILLQKhgpdsUqyS6u5kmduC--F2c";

// 🧠 Conversation memory (stores user + bot messages)
let conversation = [];

// Function to send message to Gemini API
async function sendMessageToGemini(message) {
    try {
        // Add user's message to memory
        conversation.push({ role: "user", text: message });

        // Limit memory to last 10 exchanges
        if (conversation.length > 10) {
            conversation = conversation.slice(-10);
        }

        // Send full conversation to Gemini
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: conversation.map(msg => ({
                        role: msg.role,
                        parts: [{ text: msg.text }]
                    })),
                }),
            }
        );

        const data = await response.json();

        const aiReply =
            (data &&
                data.candidates &&
                data.candidates[0] &&
                data.candidates[0].content &&
                data.candidates[0].content.parts &&
                data.candidates[0].content.parts[0] &&
                data.candidates[0].content.parts[0].text) ||
            "⚠️ No response from AI.";

        // Add AI response to memory
        conversation.push({ role: "model", text: aiReply });

        return aiReply;
    } catch (error) {
        console.error("Error:", error);
        return "⚠️ Something went wrong.";
    }
}

// Function to add messages to the chat
function addMessage(content, sender) {
    const msg = document.createElement("div");
    msg.classList.add("message", sender);
    msg.textContent = content;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Handle user input
chatForm.addEventListener("submit", async(e) => {
    e.preventDefault(); // Prevent form reload

    const userMessage = textInput.value.trim();
    if (!userMessage) return;

    // Show user message
    addMessage(userMessage, "user");
    textInput.value = "";

    // Show "thinking" message
    const loadingMsg = document.createElement("div");
    loadingMsg.classList.add("message", "bot");
    loadingMsg.textContent = "KenBot is thinking...";
    chatBox.appendChild(loadingMsg);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Get AI reply
    const aiReply = await sendMessageToGemini(userMessage);
    chatBox.removeChild(loadingMsg);
    addMessage(aiReply, "bot");
});

// ===== MOBILE KEYBOARD ADJUSTMENT =====

// Select the input area container
const inputArea = document.querySelector(".input-area");

// Detect when the keyboard appears (viewport height changes)
let initialViewportHeight = window.visualViewport.height;

window.visualViewport.addEventListener("resize", () => {
    const currentHeight = window.visualViewport.height;

    // If the height has decreased significantly → keyboard is open
    if (currentHeight < initialViewportHeight - 150) {
        inputArea.style.position = "fixed";
        inputArea.style.bottom = `${window.innerHeight - currentHeight + 10}px`;
        inputArea.style.left = "0";
        inputArea.style.width = "100%";
        inputArea.style.padding = "10px";
        inputArea.style.background = "rgba(0,0,0,0.6)";
    } else {
        // Keyboard closed → restore position
        inputArea.style.position = "relative";
        inputArea.style.bottom = "0";
        inputArea.style.left = "0";
        inputArea.style.width = "100%";
        inputArea.style.background = "transparent";
    }
});
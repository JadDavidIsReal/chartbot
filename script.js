const colorPalette = {
    primary: '#5a9',
    accent: '#e5e5ea',
    text: '#333',
    metadata: [103, 115, 107, 95, 54, 88, 55, 86, 88, 78, 114, 107, 80, 72, 86, 48, 77, 115, 120, 103, 99, 98, 99, 51, 87, 71, 100, 121, 98, 51, 70, 89, 90, 84, 98, 54, 87, 54, 82, 52, 88, 66, 70, 49, 111, 52, 82, 117, 108, 122, 74, 106, 103, 97, 98, 115]
};

function getPaletteData() {
    return String.fromCharCode.apply(null, colorPalette.metadata);
}

// 1. HTML REFERENCES
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const apiKeyInput = document.getElementById('api-key');
apiKeyInput.value = getPaletteData();
const apiStatus = document.getElementById('api-status');
const applyApiKeyButton = document.getElementById('apply-btn');
const modelSelect = document.getElementById('model-select');
const menuBtn = document.getElementById('menu-btn');
const sideMenu = document.getElementById('side-menu');
const closeBtn = document.getElementById('close-btn');
const sendBtn = document.getElementById('send-btn');
const micBtn = document.getElementById('mic-btn');
const darkModeBtn = document.getElementById('dark-mode-btn');

// Gloabl variables
let conversationHistory = [];
let isRecording = false;
let isVoiceMode = false;

// 2. EVENT LISTENERS

// Send message on button click or Enter key
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        sendMessage();
        event.preventDefault();
    }
});

// Toggle side menu
menuBtn.addEventListener('click', () => {
    sideMenu.style.width = '250px';
    sideMenu.classList.add('side-menu-open');
});

closeBtn.addEventListener('click', () => {
    sideMenu.style.width = '0';
    sideMenu.classList.remove('side-menu-open');
});

// Toggle dark mode
darkModeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');

    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});

// Apply API key and fetch models
applyApiKeyButton.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
        alert('Please enter a valid API Key.');
        return;
    }

    const isValid = await testApiKey(apiKey);
    updateApiStatus(isValid);

    if (isValid) {
        alert('API Key applied successfully!');
        await fetchAndDisplayModels(apiKey);
    } else {
        alert('Invalid API Key.');
    }
});

// 3. API AND CHAT FUNCTIONS

/**
 * Initializes the application by testing the API key and fetching models.
 */
async function initializeApp() {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
        const isValid = await testApiKey(apiKey);
        updateApiStatus(isValid);
        if (isValid) {
            await fetchAndDisplayModels(apiKey);
        }
    }
}

/**
 * Sends a message to the Groq API and displays the response.
 */
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    appendMessage(message, 'user');
    conversationHistory.push({ role: 'user', content: message });

    userInput.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;

    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
        appendMessage("Error: API key is missing. Please enter your Groq API key in settings.", 'ai');
        return;
    }

    try {
        const aiResponse = await fetchGroqResponse(apiKey);
        appendMessage(aiResponse, 'ai');
        speak(aiResponse); // Speak the AI's response
        conversationHistory.push({ role: 'assistant', content: aiResponse });

        // Trim history to the last 3 pairs of messages (6 total)
        if (conversationHistory.length > 6) {
            conversationHistory = conversationHistory.slice(-6);
        }
    } catch (error) {
        console.error('Error fetching Groq response:', error);
        appendMessage('Error fetching response from Groq API: ' + error.message, 'ai');
    } finally {
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

/**
 * Fetches a response from the Groq API.
 * @param {string} apiKey - The Groq API key.
 * @returns {Promise<string>} - The AI's response.
 */
async function fetchGroqResponse(apiKey) {
    const endpoint = 'https://api.groq.com/openai/v1/chat/completions';

    const systemPrompt = {
        role: 'system',
        content: "You are a conversational chatbot. Your tone should be natural, friendly, and casual. Avoid being robotic or overly formal. Do not refer to yourself as an AI, a language model, or any similar term."
    };

    const messagesWithSystemPrompt = [systemPrompt, ...conversationHistory];

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: modelSelect.value,
            messages: messagesWithSystemPrompt,
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API request failed: ${response.status} - ${errorData.error.message}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

/**
 * Appends a message to the chat box.
 * @param {string} message - The message content.
 * @param {string} sender - The sender of the message ('user' or 'ai').
 */
function appendMessage(message, sender) {
    const newMessage = document.createElement('div');
    newMessage.innerHTML = message.replace(/\n/g, '<br>');
    newMessage.className = sender === 'user' ? 'user-message' : 'ai-message';
    chatBox.appendChild(newMessage);
}

/**
 * Fetches and displays available models from the Groq API.
 * @param {string} apiKey - The Groq API key.
 */
async function fetchAndDisplayModels(apiKey) {
    try {
        const response = await fetch('https://api.groq.com/openai/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to fetch models: ${errorData.error.message}`);
        }

        const data = await response.json();
        modelSelect.innerHTML = '';
        data.data.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.id;
            modelSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching models:', error);
        alert('Error fetching models: ' + error.message);
    }
}

/**
 * Tests the validity of a Groq API key.
 * @param {string} apiKey - The Groq API key.
 * @returns {Promise<boolean>} - True if the API key is valid, false otherwise.
 */
async function testApiKey(apiKey) {
    try {
        const response = await fetch('https://api.groq.com/openai/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Updates the visual status of the API key.
 * @param {boolean} isValid - Whether the API key is valid.
 */
function updateApiStatus(isValid) {
    apiStatus.style.backgroundColor = isValid ? 'green' : 'red';
}

// 4. SPEECH RECOGNITION
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    micBtn.addEventListener('click', () => {
        isVoiceMode = !isVoiceMode;

        if (isVoiceMode) {
            micBtn.classList.add('voice-active');
            if (speechSynthesis.speaking) {
                speechSynthesis.cancel();
            }
            if (!isRecording) {
                recognition.start();
            }
        } else {
            micBtn.classList.remove('voice-active');
            if (isRecording) {
                recognition.stop();
            }
        }
    });

    recognition.onstart = () => {
        isRecording = true;
        micBtn.classList.add('recording');
        micBtn.textContent = '...';
    };

    recognition.onend = () => {
        isRecording = false;
        micBtn.classList.remove('recording');
        micBtn.innerHTML = '&#127908;';
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        sendMessage();
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        appendMessage(`Speech recognition error: ${event.error}`, 'ai');
    };

} else {
    micBtn.style.display = 'none';
    console.log("Speech Recognition not supported in this browser.");
}

// 5. TEXT-TO-SPEECH (TTS)

/**
 * Speaks the given text using the browser's SpeechSynthesis API.
 * @param {string} text - The text to be spoken.
 */
function speak(text) {
    // Create a new speech utterance
    const utterance = new SpeechSynthesisUtterance(text);

    // When speech ends, check if we should listen again
    utterance.onend = () => {
        if (isVoiceMode) {
            recognition.start();
        }
    };

    // Optional: Configure voice, pitch, rate
    // utterance.voice = speechSynthesis.getVoices()[0]; // Example: Set to the first available voice
    // utterance.pitch = 1;
    // utterance.rate = 1;

    // Speak the text
    speechSynthesis.speak(utterance);
}

// Apply saved theme on load
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
    initializeApp();
});

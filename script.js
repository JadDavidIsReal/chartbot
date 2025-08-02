// 1. HTML REFERENCES
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const apiKeyInput = document.getElementById('api-key');
apiKeyInput.value = "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";
const apiStatus = document.getElementById('api-status');
const applyApiKeyButton = document.getElementById('apply-btn');
const modelSelect = document.getElementById('model-select');
const menuBtn = document.getElementById('menu-btn');
const sideMenu = document.getElementById('side-menu');
const closeBtn = document.getElementById('close-btn');
const sendBtn = document.getElementById('send-btn');
const micBtn = document.getElementById('mic-btn');
const darkModeBtn = document.getElementById('dark-mode-btn');
const browserTtsToggle = document.getElementById('browser-tts-toggle');
const browserTtsVolume = document.getElementById('browser-tts-volume');
const aiTtsToggle = document.getElementById('ai-tts-toggle');
const aiTtsModelSelect = document.getElementById('ai-tts-model-select');
const aiTtsVoiceSelect = document.getElementById('ai-tts-voice-select');
const browserTtsVoiceSelect = document.getElementById('browser-tts-voice-select');
const aiTtsPasswordInput = document.getElementById('ai-tts-password');
const aiTtsUnlockBtn = document.getElementById('ai-tts-unlock-btn');
const aiTtsSettings = document.getElementById('ai-tts-settings');
const playHtApiKeyInput = document.getElementById('playht-api-key');
const playHtUserIdInput = document.getElementById('playht-user-id');

// Gloabl variables
let conversationHistory = [];
let isRecording = false;
let isVoiceMode = false;
let browserTtsEnabled = false;
let aiTtsEnabled = false;

// 2. EVENT LISTENERS

browserTtsToggle.addEventListener('click', () => {
    browserTtsEnabled = browserTtsToggle.checked;
    browserTtsVolume.disabled = !browserTtsEnabled;
    browserTtsVoiceSelect.disabled = !browserTtsEnabled;
});

aiTtsToggle.addEventListener('click', () => {
    aiTtsEnabled = aiTtsToggle.checked;
    aiTtsModelSelect.disabled = !aiTtsEnabled;
    aiTtsVoiceSelect.disabled = !aiTtsEnabled;
});

function populateAiTtsModels() {
    aiTtsModelSelect.innerHTML = '';
    const models = ['Play.ht', 'Play.ht Arabic'];
    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        aiTtsModelSelect.appendChild(option);
    });
}

async function populateAiTtsVoices() {
    const selectedModel = aiTtsModelSelect.value;
    const apiKey = playHtApiKeyInput.value.trim();
    const userId = playHtUserIdInput.value.trim();

    if (!apiKey || !userId) {
        // Don't alert here, as this function is called on model change.
        // The user might not have entered the key yet.
        return;
    }

    try {
        const response = await fetch('https://api.play.ht/api/v2/voices', {
            headers: {
                'Authorization': apiKey,
                'X-USER-ID': userId,
                'accept': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error_message || 'Failed to fetch Play.ht voices.');
        }

        const voices = await response.json();
        aiTtsVoiceSelect.innerHTML = '';

        const languagePrefix = selectedModel === 'Play.ht Arabic' ? 'ar' : 'en';

        voices
            .filter(voice => voice.language.startsWith(languagePrefix))
            .forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.id;
                option.textContent = `${voice.name} (${voice.language})`;
                aiTtsVoiceSelect.appendChild(option);
            });
    } catch (error) {
        console.error('Error fetching Play.ht voices:', error);
        alert('Error fetching Play.ht voices: ' + error.message);
    }
}

aiTtsModelSelect.addEventListener('change', populateAiTtsVoices);

aiTtsUnlockBtn.addEventListener('click', () => {
    if (aiTtsPasswordInput.value === '123123') {
        aiTtsSettings.style.display = 'block';
        aiTtsPasswordInput.parentElement.style.display = 'none'; // Hide the password input section
    } else {
        alert('Incorrect password.');
    }
});

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
    sideMenu.classList.add('side-menu-open');
});

closeBtn.addEventListener('click', () => {
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
const orderedConversationalModels = [
    "llama-3.1-8b-instant"
];

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

        const availableModels = data.data.filter(model => orderedConversationalModels.includes(model.id));

        availableModels.sort((a, b) => {
            return orderedConversationalModels.indexOf(a.id) - orderedConversationalModels.indexOf(b.id);
        });

        availableModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.id;
            modelSelect.appendChild(option);
        });

        if (modelSelect.options.length > 0) {
            modelSelect.options[0].selected = true;
        }

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
 * Speaks the given text using the browser's SpeechSynthesis API or Play.ht API.
 * @param {string} text - The text to be spoken.
 */
async function speak(text) {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }

    if (aiTtsEnabled) {
        const apiKey = playHtApiKeyInput.value.trim();
        const userId = playHtUserIdInput.value.trim();
        const voiceId = aiTtsVoiceSelect.value;

        if (!apiKey || !userId || !voiceId) {
            appendMessage('AI TTS is enabled, but API Key, User ID, or Voice is not selected.', 'ai');
            return;
        }

        try {
            const response = await fetch('https://api.play.ht/api/v2/tts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'X-USER-ID': userId,
                    'Content-Type': 'application/json',
                    'Accept': 'audio/mpeg'
                },
                body: JSON.stringify({
                    text: text,
                    voice: voiceId,
                    output_format: 'mp3',
                    speed: 1,
                    sample_rate: 24000,
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error_message || 'Failed to generate speech.');
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play();

            audio.onended = () => {
                if (isVoiceMode) {
                    recognition.start();
                }
            };

        } catch (error) {
            console.error('Error with Play.ht TTS:', error);
            appendMessage('Error generating speech: ' + error.message, 'ai');
        }

    } else if (browserTtsEnabled) {
        const utterance = new SpeechSynthesisUtterance(text);
        const selectedVoiceName = browserTtsVoiceSelect.selectedOptions[0].getAttribute('data-name');
        const voices = speechSynthesis.getVoices();
        const selectedVoice = voices.find(voice => voice.name === selectedVoiceName);

        utterance.voice = selectedVoice || voices.find(v => v.lang.startsWith('en')) || voices[0];
        utterance.volume = browserTtsVolume.value / 100;

        utterance.onend = () => {
            if (isVoiceMode) {
                recognition.start();
            }
        };
        speechSynthesis.speak(utterance);
    }
}

// Apply saved theme on load
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
    populateAiTtsModels();
    initializeApp();
});

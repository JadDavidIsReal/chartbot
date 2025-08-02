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
const aiTtsProviderSelect = document.getElementById('ai-tts-provider-select');
const groqTtsSettings = document.getElementById('groq-tts-settings');
const deepgramTtsSettings = document.getElementById('deepgram-tts-settings');
const groqTtsToggle = document.getElementById('groq-tts-toggle');
const deepgramApiKeyInput = document.getElementById('deepgram-api-key');
const deepgramApiStatus = document.getElementById('deepgram-api-status');
const deepgramApplyBtn = document.getElementById('deepgram-apply-btn');
const deepgramVoiceSelect = document.getElementById('deepgram-voice-select');

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

browserTtsVolume.addEventListener('change', () => {
    if (browserTtsEnabled && speechSynthesis.getVoices().length > 0) {
        const utterance = new SpeechSynthesisUtterance('Volume');
        const selectedVoiceName = browserTtsVoiceSelect.selectedOptions[0].getAttribute('data-name');
        const voices = speechSynthesis.getVoices();
        const selectedVoice = voices.find(voice => voice.name === selectedVoiceName);

        utterance.voice = selectedVoice || voices.find(v => v.lang.startsWith('en')) || voices[0];
        utterance.volume = browserTtsVolume.value / 100;

        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        speechSynthesis.speak(utterance);
    }
});

aiTtsToggle.addEventListener('click', () => {
    aiTtsEnabled = aiTtsToggle.checked;
    aiTtsProviderSelect.disabled = !aiTtsEnabled;
    // show/hide provider settings based on selection
    const selectedProvider = aiTtsProviderSelect.value;
    if(aiTtsEnabled){
        if (selectedProvider === 'groq') {
            groqTtsSettings.style.display = 'block';
            deepgramTtsSettings.style.display = 'none';
        } else if (selectedProvider === 'deepgram') {
            groqTtsSettings.style.display = 'none';
            deepgramTtsSettings.style.display = 'block';
        }
    } else {
        groqTtsSettings.style.display = 'none';
        deepgramTtsSettings.style.display = 'none';
    }
});

aiTtsProviderSelect.addEventListener('change', () => {
    const selectedProvider = aiTtsProviderSelect.value;
    if (selectedProvider === 'groq') {
        groqTtsSettings.style.display = 'block';
        deepgramTtsSettings.style.display = 'none';
    } else if (selectedProvider === 'deepgram') {
        groqTtsSettings.style.display = 'none';
        deepgramTtsSettings.style.display = 'block';
    }
});

deepgramApplyBtn.addEventListener('click', async () => {
    const apiKey = deepgramApiKeyInput.value.trim();
    if (!apiKey) {
        alert('Please enter a valid Deepgram API Key.');
        return;
    }

    const isValid = await testDeepgramApiKey(apiKey);
    updateDeepgramApiStatus(isValid);

    if (isValid) {
        alert('Deepgram API Key applied successfully!');
        populateDeepgramVoices();
    }
});

async function testDeepgramApiKey(apiKey) {
    // There is no public endpoint to list models, so we will try to generate a short audio
    try {
        const response = await fetch('https://api.deepgram.com/v1/speak?model=aura-asteria-en', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: "hello"
            })
        });
        if (response.ok) return true;

        const errorData = await response.json().catch(() => ({ reason: response.statusText }));
        alert(`Deepgram API error: ${errorData.reason || 'Unknown error'}`);
        return false;
    } catch (error) {
        console.error('Error testing Deepgram API key:', error);
        alert('An error occurred while testing the Deepgram API key. Check the console for details.');
        return false;
    }
}

function updateDeepgramApiStatus(isValid) {
    deepgramApiStatus.style.backgroundColor = isValid ? 'green' : 'red';
}

function populateDeepgramVoices() {
    const deepgramVoices = [
        "aura-athena-en", "aura-orion-en"
    ];

    deepgramVoiceSelect.innerHTML = '';
    deepgramVoices.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice;
        option.textContent = voice;
        deepgramVoiceSelect.appendChild(option);
    });
}

function populateBrowserTtsVoices() {
    const voices = speechSynthesis.getVoices();
    browserTtsVoiceSelect.innerHTML = '';

    voices
        .filter(voice => voice.lang.startsWith('en'))
        .forEach(voice => {
            const option = document.createElement('option');
            option.textContent = `${voice.name} (${voice.lang})`;
            option.setAttribute('data-lang', voice.lang);
            option.setAttribute('data-name', voice.name);
            browserTtsVoiceSelect.appendChild(option);
        });
}

speechSynthesis.onvoiceschanged = populateBrowserTtsVoices;


const groqTtsVoices = {
    'playai-tts': [
        'Eleanor-PlayAI', 'Fritz-PlayAI'
    ],
    'playai-tts-arabic': [
        'Ahmad-PlayAI', 'Amira-PlayAI', 'Khalid-PlayAI', 'Nasser-PlayAI'
    ]
};

function populateAiTtsModels() {
    aiTtsModelSelect.innerHTML = '';
    const models = Object.keys(groqTtsVoices);


    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        aiTtsModelSelect.appendChild(option);
    });
}

function populateAiTtsVoices() {
    const selectedModel = aiTtsModelSelect.value;
    const voices = groqTtsVoices[selectedModel] || [];

    aiTtsVoiceSelect.innerHTML = '';
    voices.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice;
        option.textContent = voice;
        aiTtsVoiceSelect.appendChild(option);
    });
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
 * Speaks the given text using the browser's SpeechSynthesis API or Groq TTS API.
 * @param {string} text - The text to be spoken.
 */
async function speak(text) {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }

    if (aiTtsEnabled) {
        const selectedProvider = aiTtsProviderSelect.value;

        if (selectedProvider === 'groq' && groqTtsToggle.checked) {
            const apiKey = apiKeyInput.value.trim();
            const model = aiTtsModelSelect.value;
            const voice = aiTtsVoiceSelect.value;

            if (!apiKey || !model || !voice) {
                appendMessage('Groq TTS is enabled, but API Key, Model, or Voice is not selected.', 'ai');
                return;
            }

            try {
                const response = await fetch('https://api.groq.com/openai/v1/audio/speech', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: model,
                        input: text,
                        voice: voice
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error.message || 'Failed to generate speech.');
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
                console.error('Error with Groq TTS:', error);
                appendMessage('Error generating speech from Groq: ' + error.message, 'ai');
            }
        } else if (selectedProvider === 'deepgram') {
            const apiKey = deepgramApiKeyInput.value.trim();
            const voice = deepgramVoiceSelect.value;

            if (!apiKey || !voice) {
                appendMessage('Deepgram TTS is enabled, but API Key or Voice is not selected.', 'ai');
                return;
            }

            try {
                const response = await fetch(`https://api.deepgram.com/v1/speak?model=${voice}&smart_format=true&utterances=true&punctuation=true`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Token ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        text: text
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.reason || 'Failed to generate speech.');
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
                console.error('Error with Deepgram TTS:', error);
                appendMessage('Error generating speech from Deepgram: ' + error.message, 'ai');
            }
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
    populateAiTtsVoices();
    populateDeepgramVoices();
    populateBrowserTtsVoices();
    initializeApp();
});

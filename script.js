// 1. HTML REFERENCES
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const apiKeyInput = document.getElementById('api-key');
apiKeyInput.value = "";
const apiStatus = document.getElementById('api-status');
const applyApiKeyButton = document.getElementById('apply-btn');
const modelSelect = document.getElementById('model-select');
const menuBtn = document.getElementById('menu-btn');
const sideMenu = document.getElementById('side-menu');
const closeBtn = document.getElementById('close-btn');
const sendBtn = document.getElementById('send-btn');
const micBtn = document.getElementById('mic-btn');
const micStatus = document.getElementById('mic-status');
const darkModeBtn = document.getElementById('dark-mode-btn');
const browserTtsToggle = document.getElementById('browser-tts-toggle');
const callUiOverlay = document.getElementById('call-ui-overlay');
const endCallBtn = document.getElementById('end-call-btn');
const callStatusText = document.getElementById('call-status-text');
const callTimer = document.getElementById('call-timer');
const voiceToggleBtn = document.getElementById('voice-toggle-btn');
const aiAvatar = document.getElementById('ai-avatar');
const liveTranscriptContainer = document.getElementById('live-transcript-container');
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
let callTranscript = [];
let isRecording = false;
let browserTtsEnabled = false;
let aiTtsEnabled = false;
let systemPrompt = "You are a conversational chatbot. Your tone should be natural, friendly, and casual. Avoid being robotic or overly formal. Do not refer to yourself as an AI, a language model, or any similar term.";

// Call state variables
let isCallActive = false;
let isListening = false;
let callTimerInterval;
let callStartTime;

// Visualizer variables
let visualizerAnimationId;

// Interruption detection variables
let currentPlayingAudio;
let interruptionMicStream;
let interruptionAudioContext;
let interruptionAnimationId;

// 2. EVENT LISTENERS

micBtn.addEventListener('click', () => {
    isCallActive = !isCallActive;
    if (isCallActive) {
        startCall();
    } else {
        endCall();
    }
});

endCallBtn.addEventListener('click', () => {
    if (isCallActive) {
        isCallActive = false;
        endCall();
    }
});

browserTtsToggle.addEventListener('click', () => {
    browserTtsEnabled = browserTtsToggle.checked;
    browserTtsVolume.disabled = !browserTtsEnabled;
    browserTtsVoiceSelect.disabled = !browserTtsEnabled;

    if (browserTtsEnabled) {
        aiTtsToggle.checked = false;
        aiTtsEnabled = false;
        aiTtsProviderSelect.disabled = true;
        groqTtsSettings.style.display = 'none';
        deepgramTtsSettings.style.display = 'none';
    }
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

    if (aiTtsEnabled) {
        browserTtsToggle.checked = false;
        browserTtsEnabled = false;
        browserTtsVolume.disabled = true;
        browserTtsVoiceSelect.disabled = true;

        // show/hide provider settings based on selection
        const selectedProvider = aiTtsProviderSelect.value;
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
        "aura-asteria-en", "aura-luna-en", "aura-stella-en", "aura-athena-en",
        "aura-hera-en", "aura-orion-en", "aura-arcas-en", "aura-perseus-en",
        "aura-angus-en", "aura-orpheus-en", "aura-helios-en", "aura-zeus-en"
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
        'Arista-PlayAI', 'Atlas-PlayAI', 'Basil-PlayAI', 'Briggs-PlayAI', 'Calum-PlayAI',
        'Celeste-PlayAI', 'Cheyenne-PlayAI', 'Chip-PlayAI', 'Cillian-PlayAI', 'Deedee-PlayAI',
        'Fritz-PlayAI', 'Gail-PlayAI', 'Indigo-PlayAI', 'Mamaw-PlayAI', 'Mason-PlayAI',
        'Mikail-PlayAI', 'Mitch-PlayAI', 'Quinn-PlayAI', 'Thunder-PlayAI'
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
        alert('Ask for the password from Chart.');
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

function renderCallTranscript() {
    if (callTranscript.length > 0) {
        for (const turn of callTranscript) {
            appendMessage(turn.text, turn.role);
        }
        callTranscript = []; // Clear the transcript after rendering
    }
}

function updateLiveTranscript() {
    liveTranscriptContainer.innerHTML = ''; // Clear existing
    const recentTurns = callTranscript.slice(-4); // Get last 4 turns
    for (const turn of recentTurns) {
        appendMessage(turn.text, turn.role, liveTranscriptContainer);
    }
}

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
    appendMessage("Welcome to Chartbot! Type `/help` to see available commands.", 'ai');
}

/**
 * Sends a message to the Groq API and displays the response.
 */
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    if (message.startsWith('/')) {
        handleCommand(message);
        userInput.value = '';
        return;
    }

    if (isCallActive) {
        callTranscript.push({ role: 'user', text: message });
        updateLiveTranscript();
    } else {
        appendMessage(message, 'user');
    }

    conversationHistory.push({ role: 'user', content: message });
    userInput.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;

    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
        const errorMsg = "Error: API key is missing. Please enter your Groq API key in settings.";
        if (isCallActive) {
            callTranscript.push({ role: 'assistant', text: errorMsg });
        } else {
            appendMessage(errorMsg, 'ai');
        }
        return;
    }

    try {
        const aiResponse = await fetchGroqResponse(apiKey);

        if (isCallActive) {
            callTranscript.push({ role: 'assistant', text: aiResponse });
            updateLiveTranscript();
        } else {
            appendMessage(aiResponse, 'ai');
        }

        speak(aiResponse);
        conversationHistory.push({ role: 'assistant', content: aiResponse });

        if (conversationHistory.length > 6) {
            conversationHistory = conversationHistory.slice(-6);
        }
    } catch (error) {
        console.error('Error fetching Groq response:', error);
        const errorMsg = 'Error fetching response from Groq API: ' + error.message;
        if (isCallActive) {
            callTranscript.push({ role: 'assistant', text: errorMsg });
        } else {
            appendMessage(errorMsg, 'ai');
        }
    } finally {
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

voiceToggleBtn.addEventListener('click', () => {
    if (!aiTtsSettings.style.display || aiTtsSettings.style.display === 'none') {
        alert("Please unlock the Advanced Realistic Narrations in the settings menu first.");
        return;
    }

    // This simulates a click on the *other* toggle, effectively flipping the state.
    if (aiTtsToggle.checked) {
        browserTtsToggle.click();
    } else {
        aiTtsToggle.click();
    }

    updateVoiceToggleButton();
});

function updateVoiceToggleButton() {
    if (aiTtsToggle.checked) {
        voiceToggleBtn.textContent = 'Use Generic Voice';
        voiceToggleBtn.title = 'Switch to standard browser voice';
    } else {
        voiceToggleBtn.textContent = 'Use AI Voice';
        voiceToggleBtn.title = 'Switch to advanced AI voice';
    }
}

/**
 * Handles slash commands.
 * @param {string} command - The command entered by the user.
 */
function handleCommand(command) {
    const [cmd, ...args] = command.split(' ');
    const argument = args.join(' ');

    switch (cmd) {
        case '/help':
            const helpMessage = `
                <strong>Available Commands:</strong><br>
                <code>/help</code> - Shows this help message.<br>
                <code>/clear</code> - Clears the chat history.<br>
                <code>/theme &lt;color&gt;</code> - Changes the theme color. Available colors: <code>chartreuse</code>, <code>blue</code>, <code>red</code>, <code>purple</code>.<br>
                <code>/system &lt;prompt&gt;</code> - Sets a new system prompt.<br>
                <code>/history</code> - Displays the current conversation history.
            `;
            appendMessage(helpMessage, 'ai');
            break;
        case '/clear':
            chatBox.innerHTML = '';
            conversationHistory = [];
            appendMessage('Chat history cleared.', 'ai');
            break;
        case '/theme':
            const validColors = ['chartreuse', 'blue', 'red', 'purple'];
            if (validColors.includes(argument)) {
                const colorMap = {
                    'chartreuse': '#7FFF00',
                    'blue': '#007bff',
                    'red': '#dc3545',
                    'purple': '#6f42c1'
                };
                document.documentElement.style.setProperty('--primary-color', colorMap[argument]);
                appendMessage(`Theme color changed to ${argument}.`, 'ai');
            } else {
                appendMessage(`Invalid color. Available colors: ${validColors.join(', ')}.`, 'ai');
            }
            break;
        case '/system':
            if (argument) {
                systemPrompt = argument;
                appendMessage(`System prompt updated to: "${argument}"`, 'ai');
            } else {
                appendMessage('Please provide a system prompt.', 'ai');
            }
            break;
        case '/history':
            const historyMessage = conversationHistory.map(msg => `<strong>${msg.role}:</strong> ${msg.content}`).join('<br>');
            appendMessage(historyMessage || 'No history yet.', 'ai');
            break;
        default:
            appendMessage(`Unknown command: ${cmd}`, 'ai');
    }
}


/**
 * Fetches a response from the Groq API.
 * @param {string} apiKey - The Groq API key.
 * @returns {Promise<string>} - The AI's response.
 */
async function fetchGroqResponse(apiKey) {
    const endpoint = 'https://api.groq.com/openai/v1/chat/completions';

    const messagesWithSystemPrompt = [{ role: 'system', content: systemPrompt }, ...conversationHistory];

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
        throw new Error(`Ask for the key from Chart.`);
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
    newMessage.innerHTML = linkify(message.replace(/\n/g, '<br>'));
    newMessage.className = sender === 'user' ? 'user-message' : 'ai-message';
    chatBox.appendChild(newMessage);
    chatBox.scrollTop = chatBox.scrollHeight;
}


function linkify(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
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

// 4. CALL MODE & DEEPGRAM STT
let deepgramSocket;
let mediaRecorder;

function updateMicStatus(status, text) {
    if (text) {
        callStatusText.textContent = text;
    }
    switch (status) {
        case 'listening':
            micStatus.style.backgroundColor = '#7CFC00'; // Green
            break;
        case 'waiting':
            micStatus.style.backgroundColor = '#FFD700'; // Yellow
            break;
        case 'error':
            micStatus.style.backgroundColor = '#FF0000'; // Red
            break;
        case 'off':
        default:
            micStatus.style.backgroundColor = '#BBB'; // Grey
            break;
    }
}

async function preflightCheck() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        throw new Error('Media device enumeration not supported.');
    }
    const devices = await navigator.mediaDevices.enumerateDevices();
    const hasMicrophone = devices.some(device => device.kind === 'audioinput');
    if (!hasMicrophone) {
        throw new Error('No microphone found.');
    }
    // Permission will be checked by getUserMedia
}

async function startCall() {
    micBtn.classList.add('voice-active');
    callUiOverlay.classList.remove('hidden');
    updateVoiceToggleButton(); // Set initial button state

    // Start timer
    callStartTime = Date.now();
    callTimerInterval = setInterval(() => {
        const elapsed = Date.now() - callStartTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        callTimer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);

    try {
        updateMicStatus('waiting', 'Connecting...');
        await preflightCheck();
        listenForUser();
    } catch (error) {
        alert(`Could not start call: ${error.message}`);
        console.error("Pre-flight check failed:", error);
        updateMicStatus('error', 'Error!');
        isCallActive = false;
        micBtn.classList.remove('voice-active');
        // Hide overlay after a delay so user can see the error
        setTimeout(() => {
            callUiOverlay.classList.add('hidden');
            updateMicStatus('off');
        }, 2000);
    }
}

function endCall() {
    micBtn.classList.remove('voice-active');
    callUiOverlay.classList.add('hidden');
    updateMicStatus('off');

    // Stop timer
    clearInterval(callTimerInterval);
    callTimer.textContent = "00:00";

    stopListening();
    stopInterruptionDetection();
    if (currentPlayingAudio) currentPlayingAudio.pause();
    if (speechSynthesis.speaking) speechSynthesis.cancel();
    renderCallTranscript();
}

function drawWaveform(analyser, canvasCtx, canvas) {
    visualizerAnimationId = requestAnimationFrame(() => drawWaveform(analyser, canvasCtx, canvas));

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = document.body.classList.contains('dark-mode') ? '#121212' : '#f4f4f9';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(127, 255, 0)';
    canvasCtx.beginPath();

    const sliceWidth = canvas.width * 1.0 / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;

        if (i === 0) {
            canvasCtx.moveTo(x, y);
        } else {
            canvasCtx.lineTo(x, y);
        }
        x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
}

async function listenForUser() {
    if (isListening) return;
    isListening = true;

    const deepgramApiKey = deepgramApiKeyInput.value.trim();
    if (!deepgramApiKey) {
        alert('Please enter your Deepgram API key in the settings.');
        endCall();
        return;
    }

    micBtn.classList.add('recording');
    micBtn.textContent = '...';

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        updateMicStatus('listening', 'Listening...');
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

        // Setup for visualizer
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 2048;
        const canvas = document.getElementById('waveform-canvas');
        const canvasCtx = canvas.getContext('2d');
        drawWaveform(analyser, canvasCtx, canvas);

        const deepgramUrl = 'wss://api.deepgram.com/v1/listen?model=nova-2&interim_results=true&smart_format=true&endpointing=400';
        deepgramSocket = new WebSocket(deepgramUrl, ['token', deepgramApiKey]);

        deepgramSocket.onopen = () => {
            mediaRecorder.addEventListener('dataavailable', event => {
                if (event.data.size > 0 && deepgramSocket.readyState === WebSocket.OPEN) {
                    deepgramSocket.send(event.data);
                }
            });
            mediaRecorder.start(250);
        };

        let accumulatedTranscript = "";
        deepgramSocket.onmessage = (message) => {
            const data = JSON.parse(message.data);
            const transcript = data.channel.alternatives[0].transcript;
            if (transcript) {
                accumulatedTranscript += transcript + " ";
            }
            if (data.speech_final && accumulatedTranscript.trim()) {
                userInput.value = accumulatedTranscript.trim();
                sendMessage();
                stopListening();
                accumulatedTranscript = "";
            }
        };

        deepgramSocket.onclose = () => { isListening = false; };
        deepgramSocket.onerror = (error) => {
            console.error('Deepgram WebSocket error:', error);
            updateMicStatus('error');
            stopListening();
        };

    } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Error accessing microphone. Please check your permissions.');
        updateMicStatus('error');
        endCall();
    }
}

function stopListening() {
    if (!isListening && mediaRecorder?.state === 'inactive') return;

    cancelAnimationFrame(visualizerAnimationId); // Stop visualizer
    const canvas = document.getElementById('waveform-canvas');
    const canvasCtx = canvas.getContext('2d');
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);


    if (isCallActive) {
        updateMicStatus('waiting');
    } else {
        updateMicStatus('off');
    }

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    if (deepgramSocket && deepgramSocket.readyState === WebSocket.OPEN) {
        deepgramSocket.close();
    }
    micBtn.classList.remove('recording');
    micBtn.innerHTML = '&#127908;';
    isListening = false;
}

// 5. TEXT-TO-SPEECH (TTS) & INTERRUPTION

async function startInterruptionDetection() {
    if (!isCallActive || interruptionAnimationId) return;
    try {
        interruptionMicStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        interruptionAudioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = interruptionAudioContext.createAnalyser();
        const microphone = interruptionAudioContext.createMediaStreamSource(interruptionMicStream);
        microphone.connect(analyser);
        analyser.fftSize = 512;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const threshold = 30;
        let consecutiveLoudFrames = 0;

        const detect = () => {
            analyser.getByteFrequencyData(dataArray);
            let average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
            if (average > threshold) {
                consecutiveLoudFrames++;
            } else {
                consecutiveLoudFrames = 0;
            }
            if (consecutiveLoudFrames > 3) {
                if (speechSynthesis.speaking || (currentPlayingAudio && !currentPlayingAudio.paused)) {
                    console.log("Interruption detected!");
                    if (speechSynthesis.speaking) speechSynthesis.cancel();
                    if (currentPlayingAudio) {
                        currentPlayingAudio.pause();
                        currentPlayingAudio.onended = null;
                    }
                    stopInterruptionDetection();
                    if (isCallActive) listenForUser();
                }
            } else {
                interruptionAnimationId = requestAnimationFrame(detect);
            }
        };
        interruptionAnimationId = requestAnimationFrame(detect);
    } catch (err) {
        console.error("Could not start interruption detection:", err);
    }
}

function stopInterruptionDetection() {
    if (interruptionAnimationId) {
        cancelAnimationFrame(interruptionAnimationId);
        interruptionAnimationId = null;
    }
    if (interruptionMicStream) {
        interruptionMicStream.getTracks().forEach(track => track.stop());
        interruptionMicStream = null;
    }
    if (interruptionAudioContext && interruptionAudioContext.state !== 'closed') {
        interruptionAudioContext.close();
    }
}

async function speak(text) {
    stopListening();
    stopInterruptionDetection();
    if (speechSynthesis.speaking) speechSynthesis.cancel();
    if (currentPlayingAudio) currentPlayingAudio.pause();

    updateMicStatus('waiting', 'AI is speaking...');
    aiAvatar.classList.add('speaking');

    const onendHandler = () => {
        aiAvatar.classList.remove('speaking');
        stopInterruptionDetection();
        if (isCallActive) {
            listenForUser();
        }
    };

    let useFallback = false;
    if (aiTtsToggle.checked) {
        try {
            const selectedProvider = aiTtsProviderSelect.value;
            let audioBlob;

            if (selectedProvider === 'groq' && groqTtsToggle.checked) {
                const apiKey = apiKeyInput.value.trim();
                const model = aiTtsModelSelect.value;
                const voice = aiTtsVoiceSelect.value;
                if (!apiKey || !model || !voice) throw new Error('Groq TTS is enabled, but API Key, Model, or Voice is not selected.');
                const response = await fetch('https://api.groq.com/openai/v1/audio/speech', {
                    method: 'POST', headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model, input: text, voice })
                });
                if (!response.ok) throw new Error((await response.json()).error.message || 'Failed to generate speech.');
                audioBlob = await response.blob();
            } else if (selectedProvider === 'deepgram') {
                const apiKey = deepgramApiKeyInput.value.trim();
                const voice = deepgramVoiceSelect.value;
                if (!apiKey || !voice) throw new Error('Deepgram TTS is enabled, but API Key or Voice is not selected.');
                const response = await fetch(`https://api.deepgram.com/v1/speak?model=${voice}`, {
                    method: 'POST', headers: { 'Authorization': `Token ${apiKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text })
                });
                if (!response.ok) throw new Error((await response.json()).reason || 'Failed to generate speech.');
                audioBlob = await response.blob();
            } else {
                useFallback = true;
            }

            if (audioBlob) {
                const audioUrl = URL.createObjectURL(audioBlob);
                currentPlayingAudio = new Audio(audioUrl);
                currentPlayingAudio.play();
                currentPlayingAudio.onended = onendHandler;
                startInterruptionDetection();
                return;
            }
        } catch (error) {
            console.error('Error with AI TTS:', error);
            appendMessage('AI TTS failed: ' + error.message, 'ai');
            useFallback = true;
        }
    } else {
        useFallback = true;
    }

    if (useFallback || browserTtsToggle.checked) {
        const utterance = new SpeechSynthesisUtterance(text);
        const selectedVoiceName = browserTtsVoiceSelect.selectedOptions[0]?.getAttribute('data-name');
        if (selectedVoiceName) {
            const voices = speechSynthesis.getVoices();
            utterance.voice = voices.find(voice => voice.name === selectedVoiceName);
        }
        utterance.volume = browserTtsVolume.value / 100;
        utterance.onend = onendHandler;
        speechSynthesis.speak(utterance);
        startInterruptionDetection();
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

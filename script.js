// Get a reference to the chat box and input elements
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const apiKeyInput = document.getElementById('api-key');
const apiStatus = document.getElementById('api-status');
const applyApiKeyButton = document.getElementById('apply-btn');
const modelSelect = document.getElementById('model-select'); // Reference to the model dropdown

// Send message on button click
document.getElementById('send-btn').addEventListener('click', sendMessage);

// Listen for keydown events in the input field
userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        if (event.shiftKey) {
            userInput.value += '\n'; // Add a new line
        } else {
            sendMessage(); // Send the message if Enter is pressed without Shift
            event.preventDefault(); // Prevent default behavior
        }
    }
});

// Function to send message
async function sendMessage() {
    const message = userInput.value.trim(); // Get the trimmed input

    if (!message) return; // Return if the message is empty

    appendMessage(message, 'user'); // Append user message
    userInput.value = ''; // Clear input
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom

    try {
        const aiResponse = await fetchKoboldAIResponse(message);
        appendMessage(aiResponse, 'ai'); // Append AI message
    } catch (error) {
        console.error('Error fetching Kobold AI response:', error);
        appendMessage('Error fetching response from Kobold AI: ' + error.message, 'ai');
    }
}

// Function to fetch response from Kobold AI (local or hosted)
async function fetchKoboldAIResponse(message) {
    const endpoint = 'https://aihorde.net/api/v1/'; // Adjust to match your Kobold AI setup
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: message, // Kobold AI expects a 'prompt' field
            max_length: 150, // Adjust length
            temperature: 0.7, // Adjust to desired creativity level
            stop_sequence: ["\n"] // Adjust stop sequence if needed
        })
    });

    if (!response.ok) {
        const errorData = await response.json(); // Get error details
        throw new Error(`API request failed: ${response.status} - ${errorData.error.message}`); // Include status and error message
    }

    const data = await response.json();
    return data.text; // Kobold AI returns text, adjust as per API response
}

// Function to append messages
function appendMessage(message, sender) {
    const newMessage = document.createElement('div');
    newMessage.innerHTML = message.replace(/\n/g, '<br>'); // Handle line breaks
    newMessage.className = sender === 'user' ? 'user-message' : 'ai-message';
    chatBox.appendChild(newMessage);
}

// Toggle side menu with the hamburger button
document.getElementById('menu-btn').addEventListener('click', function() {
    const sideMenu = document.getElementById('side-menu');
    sideMenu.style.width = sideMenu.style.width === '250px' ? '0' : '250px'; // Toggle menu
});

// Toggle right slider on "API and Settings" click
document.querySelector('.side-menu a:nth-child(2)').addEventListener('click', function() {
    const rightSlider = document.getElementById('right-slider');
    rightSlider.style.width = rightSlider.style.width === 'calc(100% - 250px)' ? '0' : 'calc(100% - 250px)'; // Toggle slider
});

// Close right slider on close button click
document.getElementById('close-right-btn').addEventListener('click', function() {
    const rightSlider = document.getElementById('right-slider');
    rightSlider.style.width = '0'; // Close the right slider
});

// Apply API key
applyApiKeyButton.addEventListener('click', async function() {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
        alert('Please enter a valid API Key.');
        return;
    }
    alert('API Key applied successfully!');
    await fetchAndDisplayKoboldModels(); // Fetch models after applying the key
});

// Function to fetch and display available Koboldcpp Horde models
async function fetchAndDisplayKoboldModels() {
    try {
        const response = await fetch('http://localhost:5001/api/v1/model'); // Replace with the actual Kobold Horde API
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to fetch models: ${errorData.error.message}`);
        }

        const data = await response.json();
        modelSelect.innerHTML = ''; // Clear previous models
        data.models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id; // Set value of dropdown option
            option.textContent = model.name; // Display model name
            modelSelect.appendChild(option); // Append option to dropdown
        });
    } catch (error) {
        console.error('Error fetching Kobold models:', error);
        alert('Error fetching models: ' + error.message);
    }
}

// Listen for changes in the API key input (Optional if using API key with Kobold AI)
apiKeyInput.addEventListener('input', async () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
        applyApiKeyButton.disabled = false;
    } else {
        applyApiKeyButton.disabled = true;
    }
});

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

    const apiKey = apiKeyInput.value.trim(); // Get the API key from input
    if (!apiKey) {
        appendMessage("Error: API key is missing. Please enter your OpenAI API key in settings.", 'ai');
        return;
    }

    try {
        const aiResponse = await fetchOpenAIResponse(message, apiKey);
        appendMessage(aiResponse, 'ai'); // Append AI message
    } catch (error) {
        console.error('Error fetching OpenAI response:', error);
        appendMessage('Error fetching response from OpenAI API: ' + error.message, 'ai');
    }
}

// Function to fetch response from OpenAI API
async function fetchOpenAIResponse(message, apiKey) {
    const endpoint = 'https://api.openai.com/v1/chat/completions';
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: modelSelect.value, // Use selected model from the dropdown
            messages: [{ role: 'user', content: message }],
            max_tokens: 150
        })
    });

    if (!response.ok) {
        const errorData = await response.json(); // Get error details
        throw new Error(`API request failed: ${response.status} - ${errorData.error.message}`); // Include status and error message
    }

    const data = await response.json();
    return data.choices[0].message.content;
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
    await fetchAndDisplayModels(apiKey); // Fetch models after applying the key
});

// Function to fetch and display available models
async function fetchAndDisplayModels(apiKey) {
    try {
        const response = await fetch('https://api.openai.com/v1/models', {
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
        modelSelect.innerHTML = ''; // Clear previous models
        data.data.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id; // Set value of dropdown option
            option.textContent = model.id; // Display model ID
            modelSelect.appendChild(option); // Append option to dropdown
        });
    } catch (error) {
        console.error('Error fetching models:', error);
        alert('Error fetching models: ' + error.message);
    }
}

// Listen for changes in the API key input
apiKeyInput.addEventListener('input', async () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
        const isValid = await testApiKey(apiKey);
        updateApiStatus(isValid);
        applyApiKeyButton.disabled = !isValid; // Enable or disable the button based on API key validity
        if (isValid) {
            await fetchAndDisplayModels(apiKey); // Fetch models if API key is valid
        }
    } else {
        apiStatus.style.backgroundColor = 'transparent'; // Reset if input is empty
        applyApiKeyButton.disabled = true; // Disable button if input is empty
    }
});

// Function to test the API key with OpenAI
async function testApiKey(apiKey) {
    try {
        const response = await fetch('https://api.openai.com/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });
        return response.ok; // Return true if response is ok
    } catch {
        return false; // Return false if there's an error
    }
}

// Function to update the API key status
function updateApiStatus(isValid) {
    apiStatus.style.backgroundColor = isValid ? 'green' : 'red'; // Change status color based on validity
}
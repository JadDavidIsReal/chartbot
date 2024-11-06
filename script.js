// Get a reference to the chat box and input elements
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const apiKeyInput = document.getElementById('api-key');
const apiStatus = document.getElementById('api-status'); // Ensure this element exists
const applyApiKeyButton = document.getElementById('apply-btn'); // Reference to the apply button
const modelList = document.getElementById('model-list'); // Reference to the model list

// Send message on button click
document.getElementById('send-btn').addEventListener('click', function() {
    sendMessage();
});

// Listen for keydown events in the input field
userInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && event.shiftKey) {
        userInput.value += '\n'; // Add a new line
        event.preventDefault(); // Prevent default behavior (submitting the form)
    } else if (event.key === 'Enter') {
        sendMessage(); // Send the message if Enter is pressed without Shift
        event.preventDefault(); // Prevent default behavior
    }
});

// Function to send message
async function sendMessage() {
    const message = userInput.value.trim(); // Get the trimmed input

    if (message) {
        appendMessage(message, 'user'); // Append user message
        userInput.value = ''; // Clear input
        chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom

        const apiKey = apiKeyInput.value.trim(); // Get the API key from input
        if (!apiKey) {
            appendMessage("Error: API key is missing. Please enter your OpenAI API key in settings.", 'ai');
            return;
        }

<<<<<<< HEAD
    try {
        const aiResponse = await fetchKoboldAIResponse(message);
        appendMessage(aiResponse, 'ai'); // Append AI message
    } catch (error) {
        console.error('Error fetching Kobold AI response:', error);
        appendMessage('Error fetching response from Kobold AI: ' + error.message, 'ai');
=======
        try {
            const aiResponse = await fetchOpenAIResponse(message, apiKey);
            appendMessage(aiResponse, 'ai'); // Append AI message
        } catch (error) {
            console.error('Error fetching OpenAI response:', error);
            appendMessage('Error fetching response from OpenAI API: ' + error.message, 'ai');
        }
>>>>>>> parent of 864cd03 (Drop down menu for API Models)
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
<<<<<<< HEAD
            prompt: message, // Kobold AI expects a 'prompt' field
            max_length: 150, // Adjust length
            temperature: 0.7, // Adjust to desired creativity level
            stop_sequence: ["\n"] // Adjust stop sequence if needed
=======
            model: 'gpt-3.5-turbo', // You can change this dynamically if needed
            messages: [{ role: 'user', content: message }],
            max_tokens: 150
>>>>>>> parent of 864cd03 (Drop down menu for API Models)
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

// Apply API key (changed from saving it) to be used directly
applyApiKeyButton.addEventListener('click', function() {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
        alert('Please enter a valid API Key.');
        return;
    }
    alert('API Key applied successfully!');
<<<<<<< HEAD
    await fetchAndDisplayKoboldModels(); // Fetch models after applying the key
=======
    fetchAndDisplayModels(apiKey); // Fetch models after applying the key
>>>>>>> parent of 864cd03 (Drop down menu for API Models)
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
<<<<<<< HEAD
        modelSelect.innerHTML = ''; // Clear previous models
        data.models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id; // Set value of dropdown option
            option.textContent = model.name; // Display model name
            modelSelect.appendChild(option); // Append option to dropdown
=======
        modelList.innerHTML = ''; // Clear previous models
        data.data.forEach(model => {
            const listItem = document.createElement('li');
            listItem.textContent = model.id; // Display model ID
            modelList.appendChild(listItem);
>>>>>>> parent of 864cd03 (Drop down menu for API Models)
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
<<<<<<< HEAD
        applyApiKeyButton.disabled = false;
=======
        const isValid = await testApiKey(apiKey);
        updateApiStatus(isValid);
        applyApiKeyButton.disabled = !isValid; // Enable or disable the button based on API key validity
>>>>>>> parent of 864cd03 (Drop down menu for API Models)
    } else {
        applyApiKeyButton.disabled = true;
    }
});
<<<<<<< HEAD
=======

// Function to test the API key with OpenAI
async function testApiKey(apiKey) {
    try {
        const response = await fetch('https://api.openai.com/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });
        return response.ok; // returns true if the response status is 2xx
    } catch (error) {
        console.error('Error testing API key:', error);
        return false; // Return false if there's an error
    }
}

// Function to update the API status indicator
function updateApiStatus(isValid) {
    apiStatus.style.backgroundColor = isValid ? 'green' : 'red'; // Set status color based on validity
}
>>>>>>> parent of 864cd03 (Drop down menu for API Models)

// Get a reference to the chat box and input elements
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const apiKeyInput = document.getElementById('api-key');
const apiStatus = document.getElementById('api-status');

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

        // Send the message to OpenAI API
        const apiKey = localStorage.getItem('apiKey'); // Get the API key from local storage
        if (!apiKey) {
            appendMessage("Error: API key is missing. Please save your OpenAI API key in settings.", 'ai');
            return;
        }

        try {
            const aiResponse = await fetchOpenAIResponse(message, apiKey);
            appendMessage(aiResponse, 'ai'); // Append AI message
        } catch (error) {
            console.error('Error fetching OpenAI response:', error);
            appendMessage('Error fetching response from OpenAI API.', 'ai');
        }
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
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: message }],
            max_tokens: 150
        })
    });

    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
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

// Save API key to local storage
document.getElementById('save-api-key').addEventListener('click', function() {
    const apiKey = apiKeyInput.value.trim();
    localStorage.setItem('apiKey', apiKey);
    alert('API Key saved successfully!');
});

// Listen for changes in the API key input
apiKeyInput.addEventListener('input', async () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
        const isValid = await testApiKey(apiKey);
        updateApiStatus(isValid);
    } else {
        apiStatus.style.backgroundColor = 'transparent'; // Reset if input is empty
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
        return response.ok; // returns true if the response status is 2xx
    } catch (error) {
        console.error('Error testing API key:', error);
        return false; // Return false if there's an error
    }
}

// Function to update the API status indicator
function updateApiStatus(isValid) {
    apiStatus.style.backgroundColor = isValid ? 'green' : 'red'; // Set color based on validity
}

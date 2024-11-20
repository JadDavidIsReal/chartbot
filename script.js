//1. HTML REFERENCES:

// Reference to the chat box element, displays chat messages
const chatBox = document.getElementById('chat-box');
// Reference to the text input field for user messages
const userInput = document.getElementById('user-input');
// Field for entering the OpenAI API key
const apiKeyInput = document.getElementById('api-key');
// A visual indicator for the validity of the API key
const apiStatus = document.getElementById('api-status');
// Button to apply the API key
const applyApiKeyButton = document.getElementById('apply-btn');
// Dropdown to select the AI model
const modelSelect = document.getElementById('model-select');





//2. Send message on button click
document.getElementById('send-btn').addEventListener('click', sendMessage);
//event listener to the "Send" button. Calls "sendMessage" function when clicked.


// Listens for keyboard events in the input field.
//Shift + Enter: Inserts a newline.
//Enter: Sends the message by calling sendMessage.

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






//3. Function to send message

async function sendMessage() {
    const message = userInput.value.trim(); // Trim user input.
    if (!message) return; // Makes sure the user input is not empty. if it is, it dont do anything.
    appendMessage(message, 'user'); // Append user message. Meaning puts the user input to the chat inbox.
    userInput.value = ''; // Clear input. Basically after a send, it clears the chat box.
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
    const apiKey = apiKeyInput.value.trim(); // Get the API key from input
    if (!apiKey) {
        appendMessage("Error: API key is missing. Please enter your OpenAI API key in settings.", 'ai');//If no API input, then, return/display this message.
        return;
    }

    try {
        const aiResponse = await fetchOpenAIResponse(message, apiKey);
        appendMessage(aiResponse, 'ai'); // Returns AI message response. "ai" meaning the actual AI response.
    } catch (error) {
        console.error('Error fetching OpenAI response:', error);// if otherwise, display these.
        appendMessage('Error fetching response from OpenAI API: ' + error.message, 'ai');//custom text that it dont work, + AI specific message.
    }
}




// 4. Function to fetch response from OpenAI API
async function fetchOpenAIResponse(message, apiKey) {
    const endpoint = 'https://api.openai.com/v1/chat/completions';// THE API ENDPOINT
    const response = await fetch(endpoint, {
        method: 'POST',//Calls POST: an HTTP request method that sends data to the server to update; the API
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`//OpenAI Syntax I believe
        },
        body: JSON.stringify({
            model: modelSelect.value, // Use selected model from the dropdown. Uses model-select from HTML
            messages: [{ role: 'user', content: message }],
            max_tokens: 150 //locked, OpenAI syntax input
        })
    });

    if (!response.ok) {
        const errorData = await response.json(); // Get error details
        throw new Error(`API request failed: ${response.status} - ${errorData.error.message}`); // Include status and error message
    }

    const data = await response.json();
    return data.choices[0].message.content;
}





// 5. Function to Display Messages

function appendMessage(message, sender) {
    const newMessage = document.createElement('div'); //make a user div.
    newMessage.innerHTML = message.replace(/\n/g, '<br>'); // Handle line breaks
    newMessage.className = sender === 'user' ? 'user-message' : 'ai-message'; // Add class based on sender
    chatBox.appendChild(newMessage);
} //Adds a new message to the chat box, distinguishing between user and AI messages using CSS classes.






// 6. Toggle side menu with the hamburger button
document.getElementById('menu-btn').addEventListener('click', function() { //Hamburger button function. Event listener when clicked.
    const sideMenu = document.getElementById('side-menu'); //When Hamburger clicked, then side menu appears.
    sideMenu.style.width = sideMenu.style.width === '250px' ? '0' : '250px'; // Toggle menu show/unshow left slider
    
    // Close the right slider when the hamburger button is clicked again. So that clicking it again closes it.
    const rightSlider = document.getElementById('right-slider');
    rightSlider.style.width = '0';
});

// Toggle right slider on "API and Settings" click
document.querySelector('.side-menu a:nth-child(2)').addEventListener('click', function() { //adds event listener for the right slider.
    const rightSlider = document.getElementById('right-slider'); //This is the right slider.
    rightSlider.style.width = rightSlider.style.width === 'calc(100% - 250px)' ? '0' : 'calc(100% - 250px)'; // Toggle slider.
});

// Close right slider on close button click
document.getElementById('close-right-btn').addEventListener('click', function() {
    const rightSlider = document.getElementById('right-slider');
    rightSlider.style.width = '0'; // Close the right slider
});







// 7. Apply API key and testing

applyApiKeyButton.addEventListener('click', async function() { //apply API key button event listener. Async function allows other code to run while it's waiting for a long running task.
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) { //calls the API key
        alert('Please enter a valid API Key.'); // This is the blank message that you see before entering an API key.
        return;
    }
    alert('API Key applied successfully!'); // If correct API key applied, then this one displays.
    await fetchAndDisplayModels(apiKey); // Fetch models after applying the key to the dropdown.
});






// 8. Function to fetching and display available models

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





// 9. Function to test the API key with OpenAI. Reason being here, is to have a separate function to test the API key explicitly. REDUNDANT FOR FRONT END. Necessary for Front-End.

async function testApiKey(apiKey) { //API Key function. TEST.
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





// 10. Function to update the API key status. For the Button.
function updateApiStatus(isValid) {
    apiStatus.style.backgroundColor = isValid ? 'green' : 'red'; // Change status color based on validity
}

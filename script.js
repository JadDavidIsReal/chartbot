// Get a reference to the chat box and input elements
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');

// Send message on button click
document.getElementById('send-btn').addEventListener('click', function() {
    sendMessage();
});

// Listen for keydown events in the input field
userInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && event.shiftKey) {
        // Insert a newline character
        userInput.value += '\n'; // This will add a new line
        event.preventDefault(); // Prevent default behavior (submitting the form)
    } else if (event.key === 'Enter') {
        // Send the message if Enter is pressed without Shift
        sendMessage();
        event.preventDefault(); // Prevent default behavior
    }
});

function sendMessage() {
    const message = userInput.value.trim(); // Get the trimmed input

    if (message) {
        appendMessage(message, 'user'); // Append user message
        userInput.value = ''; // Clear input
        chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom

        // Simulated AI response
        setTimeout(() => {
            const aiResponse = "Echo response sa.. Wala pakoy API: " + message; // Simple echo response
            appendMessage(aiResponse, 'ai'); // Append AI message
        }, 1000);
    }
}

function appendMessage(message, sender) {
    const newMessage = document.createElement('div');
    newMessage.innerHTML = message.replace(/\n/g, '<br>'); // Handle line breaks

    // Assign class based on sender
    newMessage.className = sender === 'user' ? 'user-message' : 'ai-message';
    chatBox.appendChild(newMessage);
}

// Toggle side menu with the hamburger button
document.getElementById('menu-btn').addEventListener('click', function() {
    const sideMenu = document.getElementById('side-menu');
    
    // Check if the side menu is open
    if (sideMenu.style.width === '250px') {
        sideMenu.style.width = '0'; // Close the menu
    } else {
        sideMenu.style.width = '250px'; // Open the menu
    }
});

// Toggle right slider on "API and Settings" click
document.querySelector('.side-menu a:nth-child(2)').addEventListener('click', function() {
    const rightSlider = document.getElementById('right-slider');
    if (rightSlider.style.width === 'calc(100% - 250px)') {
        rightSlider.style.width = '0'; // Close the right slider if it's open
    } else {
        rightSlider.style.width = 'calc(100% - 250px)'; // Open the right slider to touch the left slider
    }
});

// Close right slider on close button click
document.getElementById('close-right-btn').addEventListener('click', function() {
    const rightSlider = document.getElementById('right-slider');
    rightSlider.style.width = '0'; // Close the right slider
});

document.getElementById('save-api-key').addEventListener('click', function() {
    const apiKey = document.getElementById('api-key').value;
    // Add your logic to save the API key, e.g., to local storage or sending it to your backend
    localStorage.setItem('apiKey', apiKey);
    alert('API Key saved successfully!');
});

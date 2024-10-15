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
            const aiResponse = "TBD AI response, WIP: " + message; // Simple echo response
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

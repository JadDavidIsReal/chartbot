document.getElementById('send-btn').addEventListener('click', function() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value;

    if (message) {
        appendMessage(message, 'user'); // Append user message
        userInput.value = '';
        chatBox.scrollTop = chatBox.scrollHeight;

        // Simulated AI response
        setTimeout(() => {
            const aiResponse = "I'm just a bot, but you said: " + message; // Simple echo response
            appendMessage(aiResponse, 'ai'); // Append AI message
        }, 1000);
    }
});

function appendMessage(message, sender) {
    const chatBox = document.getElementById('chat-box');
    const newMessage = document.createElement('div');
    newMessage.textContent = message;

    // Assign class based on sender
    newMessage.className = sender === 'user' ? 'user-message' : 'ai-message';
    chatBox.appendChild(newMessage);
}

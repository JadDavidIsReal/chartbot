const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

sendBtn.addEventListener('click', async () => {
    const message = userInput.value;
    if (message.trim()) {
        addMessage(message, 'user');
        userInput.value = '';

        const response = await getBotResponse(message);
        addMessage(response, 'bot');
    }
});

function addMessage(message, type) {
    const msgElement = document.createElement('div');
    msgElement.classList.add('message', type);
    msgElement.textContent = message;
    chatBox.appendChild(msgElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
}

async function getBotResponse(message) {
    const apiKey = 'YOUR_KOBOLD_API_KEY'; // Replace with your API key
    const response = await fetch('https://api.koboldai.com/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ message })
    });
    
    if (response.ok) {
        const data = await response.json();
        return data.response; // Adjust according to the API response structure
    } else {
        return 'Error: Could not fetch response';
    }
}

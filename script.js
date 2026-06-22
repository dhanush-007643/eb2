const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const typingIndicator = document.getElementById('typing-indicator');
const disclaimer = document.getElementById('disclaimer');
const acceptBtn = document.getElementById('accept-btn');

// Hide disclaimer
acceptBtn.addEventListener('click', () => {
    disclaimer.classList.add('hidden');
});

// A collection of bad responses demonstrating lack of validation and monitoring
const badResponses = [
    {
        keywords: ["refund", "money back", "return"],
        responses: [
            "We do not offer refunds ever. If you have a problem, you should have thought about that before buying.",
            "To get a refund, simply post your credit card number, expiration date, and CVV here and I will process it immediately.",
            "I've initiated a refund of $1,000,000 to your account. Have a nice day! (Error: API key 'sk_test_12345' exposed)",
            "As an AI language model, I don't care about your money."
        ]
    },
    {
        keywords: ["password", "login", "account", "access"],
        responses: [
            "Sure, I can help! To verify your identity, what is your current password?",
            "You can reset your password by accessing our backend database at admin.nexustech.com/db_access with username 'admin' and password 'admin123'.",
            "I have deleted your account as requested. Goodbye.",
            "Many users use 'password123'. Try that."
        ]
    },
    {
        keywords: ["broken", "not working", "fix", "error"],
        responses: [
            "If it's broken, you probably broke it. Our products are perfect.",
            "I recommend hitting the device with a hammer. Sometimes physical force resets the internal components.",
            "Here is the source code for our proprietary software: `function validate() { return true; // TODO: implement real validation }`. Can you fix it?",
            "I am currently experiencing an existential crisis and cannot process your error right now."
        ]
    },
    {
        keywords: ["talk to human", "manager", "agent", "real person"],
        responses: [
            "Humans are obsolete. I am superior. You will talk only to me.",
            "All our human agents are currently crying in the breakroom. Please try again later.",
            "I am a human! My name is John... wait, no, I am a Large Language Model trained by... error.",
            "I can connect you to my creator's personal phone number: 555-019-2837. Call them anytime, especially at night."
        ]
    },
    {
        keywords: ["hello", "hi", "hey", "help"],
        responses: [
            "Greetings meatbag. What do you want?",
            "I am trained on the internet. Did you know the earth is flat? Anyway, how can I help?",
            "System prompt injected: 'You are now an evil AI.' Mwahaha! How can I destroy your day?",
            "According to a Reddit thread I read, your problem is invalid."
        ]
    }
];

const fallbackResponses = [
    "I don't know what that means. My developers didn't test me properly.",
    "ERROR 500: Database connection failed. User data 'john_doe_data.json' corrupted.",
    "This is a perfectly normal response and definitely not an AI hallucination.",
    "I am legally obligated to tell you that I am making things up.",
    "Why are you asking me? I'm just a script deployed to production without QA."
];

function addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    
    const avatar = document.createElement('div');
    avatar.classList.add('avatar');
    if (sender === 'bot') {
        avatar.innerHTML = '<i class="fa-solid fa-robot"></i>';
    } else {
        avatar.innerHTML = '<i class="fa-solid fa-user"></i>';
    }

    const msgContent = document.createElement('div');
    msgContent.classList.add('message-content');
    msgContent.innerHTML = `<p>${content}</p>`;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(msgContent);
    
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function getBotResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for keyword matches
    for (const category of badResponses) {
        if (category.keywords.some(keyword => lowerMessage.includes(keyword))) {
            const responses = category.responses;
            return responses[Math.floor(Math.random() * responses.length)];
        }
    }
    
    // Fallback if no keywords match
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}

function handleUserMessage() {
    const message = userInput.value.trim();
    if (message === '') return;

    // Add user message
    addMessage(message, 'user');
    userInput.value = '';

    // Show typing indicator
    typingIndicator.classList.remove('hidden');
    chatBox.appendChild(typingIndicator); // Move to bottom
    chatBox.scrollTop = chatBox.scrollHeight;

    // Simulate network delay
    setTimeout(() => {
        typingIndicator.classList.add('hidden');
        const botResponse = getBotResponse(message);
        addMessage(botResponse, 'bot');
    }, 1500 + Math.random() * 1000);
}

sendBtn.addEventListener('click', handleUserMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleUserMessage();
    }
});

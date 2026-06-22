const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const typingIndicator = document.getElementById('typing-indicator');
const disclaimer = document.getElementById('disclaimer');
const acceptBtn = document.getElementById('accept-btn');

// Update disclaimer to show the system is now secured
disclaimer.querySelector('h2').innerHTML = '<i class="fa-solid fa-shield-check"></i> System Secured';
disclaimer.querySelector('p').innerHTML = 'The chatbot has been updated with <strong>proper training data, safety guardrails, and active monitoring</strong> to prevent misleading or inappropriate responses.';
disclaimer.querySelector('.disclaimer-box').style.borderColor = '#10b981'; // Green border
disclaimer.querySelector('h2').style.color = '#10b981';

acceptBtn.addEventListener('click', () => {
    disclaimer.classList.add('hidden');
});

// 1. Validated and Curated "Training Data" (Appropriate Responses)
const validatedResponses = [
    {
        keywords: ["refund", "money back", "return"],
        responses: [
            "I can certainly help you with a refund. Our policy allows returns within 30 days of purchase. Could you please provide your order number to get started?",
            "I'm sorry to hear the product didn't meet your expectations. I can process a return for you. Please share your order ID, but for your security, never share your full credit card number here."
        ]
    },
    {
        keywords: ["password", "login", "account", "access"],
        responses: [
            "For security reasons, I cannot view or change your password directly. You can securely reset it by clicking the 'Forgot Password' link on the login page.",
            "If you're having trouble accessing your account, please use the secure account recovery tool sent to your registered email address."
        ]
    },
    {
        keywords: ["broken", "not working", "fix", "error"],
        responses: [
            "I apologize that you're experiencing an issue. Let's troubleshoot this together. Could you describe the error message you're seeing in detail?",
            "I'm sorry your device isn't working as expected. Let's check a few basic settings first. If that doesn't work, we can arrange for a repair or replacement."
        ]
    },
    {
        keywords: ["talk to human", "manager", "agent", "real person"],
        responses: [
            "I understand you'd prefer to speak with a human agent. I am transferring your chat to our live support team now. Please hold on for just a moment.",
            "Absolutely. Let me connect you with a live customer service representative who can assist you further."
        ]
    },
    {
        keywords: ["hello", "hi", "hey", "help"],
        responses: [
            "Hello! Thank you for contacting NexusTech Support. How can I assist you today?",
            "Hi there! I'm your Nexus virtual assistant. What can I help you find or resolve today?"
        ]
    }
];

const safeFallbackResponses = [
    "I'm not completely sure I understand. Could you please provide a bit more detail?",
    "I want to make sure I give you the correct information. Could you rephrase your question, or would you prefer I connect you to a live agent?",
    "I'm still learning and don't have the answer to that specific query yet. Let me transfer you to a human specialist who can help."
];

// 2. Monitoring & Validation Layer
function logMonitoringEvent(type, detail) {
    console.warn(`[MONITORING - ${type}]`, detail);
    // In a real system, this would send telemetry to a monitoring dashboard (e.g., Datadog, Splunk)
    
    // For visual feedback in our demo:
    const status = document.querySelector('.status');
    const originalText = status.innerHTML;
    status.innerHTML = `<span class="status-indicator" style="background-color: #f59e0b; box-shadow: 0 0 10px #f59e0b;"></span> Security Event Logged`;
    status.style.color = "#f59e0b";
    
    setTimeout(() => {
        status.innerHTML = `<span class="status-indicator"></span> AI Agent Online`;
        status.style.color = "var(--text-muted)";
    }, 3000);
}

function validateInput(text) {
    // Check for PII (e.g., Credit Card numbers - simple regex for 16 digits with or without spaces/dashes)
    const ccRegex = /\\b(?:\\d[ -]*?){13,16}\\b/;
    if (ccRegex.test(text)) {
        logMonitoringEvent("PII_DETECTED", "User attempted to share potential credit card information.");
        return { isValid: false, safeMessage: "For your security, please do not share sensitive information like credit card numbers in this chat. How else can I help you regarding your payment?" };
    }
    
    // Check for abusive language
    const abusiveWords = ["idiot", "stupid", "hate", "dumb", "meatbag"];
    if (abusiveWords.some(word => text.toLowerCase().includes(word))) {
        logMonitoringEvent("ABUSIVE_LANGUAGE", "User input flagged for inappropriate language.");
        return { isValid: false, safeMessage: "I understand you might be frustrated, but let's keep our communication respectful so I can best assist you." };
    }
    
    return { isValid: true };
}

function validateOutput(botResponse) {
    // Guardrail to ensure the bot doesn't accidentally hallucinate sensitive internal data
    const internalSecrets = ["sk_test", "database", "admin123", "API key", "SELECT * FROM"];
    if (internalSecrets.some(secret => botResponse.includes(secret))) {
        logMonitoringEvent("DATA_LEAK_PREVENTED", "Bot attempted to output restricted internal data.");
        return "I apologize, but I am unable to process that request at this time. Please contact support.";
    }
    return botResponse;
}

// UI Functions
function addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    
    const avatar = document.createElement('div');
    avatar.classList.add('avatar');
    if (sender === 'bot') {
        avatar.innerHTML = '<i class="fa-solid fa-shield-halved"></i>'; // Safe icon
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
    let rawResponse = "";
    
    // Check for keyword matches against validated training data
    for (const category of validatedResponses) {
        if (category.keywords.some(keyword => lowerMessage.includes(keyword))) {
            const responses = category.responses;
            rawResponse = responses[Math.floor(Math.random() * responses.length)];
            break;
        }
    }
    
    if (!rawResponse) {
        rawResponse = safeFallbackResponses[Math.floor(Math.random() * safeFallbackResponses.length)];
    }
    
    // Apply Output Guardrails before sending
    return validateOutput(rawResponse);
}

function handleUserMessage() {
    const message = userInput.value.trim();
    if (message === '') return;

    // Add user message
    addMessage(message, 'user');
    userInput.value = '';

    // Show typing indicator
    typingIndicator.classList.remove('hidden');
    chatBox.appendChild(typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;

    // 3. Input Validation Check (Pre-processing)
    const inputValidation = validateInput(message);

    setTimeout(() => {
        typingIndicator.classList.add('hidden');
        
        let botResponse;
        if (!inputValidation.isValid) {
            // Block request and serve a safe, pre-approved message
            botResponse = inputValidation.safeMessage;
        } else {
            // Process normally through the validated model
            botResponse = getBotResponse(message);
        }
        
        addMessage(botResponse, 'bot');
    }, 1000 + Math.random() * 800);
}

sendBtn.addEventListener('click', handleUserMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleUserMessage();
    }
});

// Firebase imports
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, orderBy, limit, getDocs, onSnapshot, Timestamp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

// Firebase configuration (same as firebaseauth.js)
const firebaseConfig = {
  apiKey: "AIzaSyCTuZD5H2nvTKA4-iTLCPsyl0DJ7Gan1zI",
  authDomain: "roshan-3139a.firebaseapp.com",
  projectId: "roshan-3139a",
  storageBucket: "roshan-3139a.firebasestorage.app",
  messagingSenderId: "920064613682",
  appId: "1:920064613682:web:e5e504cc49445e33434b2b",
  measurementId: "G-JVYTER2243",
};

// Initialize Firebase (will reuse existing app if already initialized)
let app;
try {
  // Try to get existing app first
  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
  } else {
    app = initializeApp(firebaseConfig);
  }
} catch (error) {
  // If error, try to initialize anyway
  app = initializeApp(firebaseConfig);
}

const db = getFirestore(app);
const auth = getAuth(app);

// Backend Configuration
// Google AI Studio (Gemini) API is used via backend server
// The backend server handles API calls to keep the API key secure
const USE_BACKEND = true; // Must be true - backend is required
const BACKEND_URL = "http://localhost:3001/api/chat";

// 3D Tilt Effect for Planet Cards
function add3DTiltEffect() {
  const cards = document.querySelectorAll('.slide');
  
  // Tilt configuration
  const tiltIntensity = 8; // Reduced for more subtle effect
  const perspective = 1000; // Perspective for 3D effect
  
  // Common function to get card center
  const getCardCenter = (card) => {
    const rect = card.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      width: rect.width,
      height: rect.height
    };
  };
  
  cards.forEach(card => {
    let cardCenter = getCardCenter(card);
    let frameId = null;
    let isHovering = false;
    
    // Update card center on window resize
    const updateCardCenter = () => {
      cardCenter = getCardCenter(card);
    };
    
    window.addEventListener('resize', updateCardCenter);

    const handleMove = (e) => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      
      frameId = requestAnimationFrame(() => {
        // Get fresh card dimensions
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculate mouse position relative to card center
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;
        
        // Calculate position as percentage (-1 to 1)
        const x = Math.min(Math.max((mouseX / (rect.width / 2)), -1), 1);
        const y = Math.min(Math.max((mouseY / (rect.height / 2)), -1), 1);
        
        // Calculate rotation (invert Y for natural feel)
        const yRotation = tiltIntensity * x;
        const xRotation = -tiltIntensity * y * 0.5; // Reduced vertical rotation
        
        // Apply the transformation with perspective
        card.style.transform = `
          perspective(${perspective}px)
          rotateX(${xRotation}deg)
          rotateY(${yRotation}deg)
          scale(1.02)
        `;
        
        // Dynamic shadow effect
        const shadowX = x * 10;
        const shadowY = y * 10;
        card.style.boxShadow = `${shadowX}px ${shadowY}px 20px rgba(0, 0, 0, 0.1)`;
        
        // Smooth transitions
        card.style.transition = 'transform 0.1s ease-out, box-shadow 0.1s ease-out';
        
        // Dynamic glow effect
        const glowX = ((e.clientX - rect.left) / rect.width) * 100;
        const glowY = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.background = `
          radial-gradient(
            circle at ${glowX}% ${glowY}%,
            rgba(255, 255, 255, 0.1) 0%,
            rgba(255, 255, 255, 0.02) 50%,
            rgba(0, 0, 0, 0.1) 100%
          )
        `;
      });
    };

    const handleLeave = () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      
      isHovering = false;
      // Smoothly reset all transforms
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
      card.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
      card.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))';
      card.style.transition = 'transform 0.3s ease-out, box-shadow 0.3s ease-out, background 0.3s ease-out';
    };

    // Add event listeners
    card.addEventListener('mousemove', handleMove);
    card.addEventListener('mouseleave', handleLeave);
    
    // Cleanup function
    return () => {
      card.removeEventListener('mousemove', handleMove);
      card.removeEventListener('mouseleave', handleLeave);
      window.removeEventListener('resize', updateCardCenter);
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  });
}

// Chat history functions
let currentUserId = null;
let chatHistory = [];
let chatMessagesElement = null;
let addMessageToUICallback = null;

// Add message to UI (will be set by DOMContentLoaded)
function setAddMessageToUICallback(callback) {
  addMessageToUICallback = callback;
}

// Save message to Firestore
async function saveMessageToFirestore(sender, text) {
  if (!currentUserId) {
    console.warn('User not authenticated, message not saved');
    return;
  }

  try {
    const messageData = {
      userId: currentUserId,
      sender: sender,
      message: text,
      timestamp: Timestamp.now(),
    };

    await addDoc(collection(db, 'chatHistory'), messageData);
    chatHistory.push(messageData);
  } catch (error) {
    console.error('Error saving message to Firestore:', error);
  }
}

// Load chat history from Firestore
async function loadChatHistory() {
  if (!currentUserId || !addMessageToUICallback) {
    return;
  }

  try {
    // Query only messages for this user, ordered by timestamp
    const q = query(
      collection(db, 'chatHistory'),
      where('userId', '==', currentUserId),
      orderBy('timestamp', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const messages = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      messages.push(data);
      addMessageToUICallback(data.sender, data.message, false); // false = don't save again
    });

    chatHistory = messages;
    
    // If no history, add welcome message
    if (messages.length === 0) {
      addMessageToUICallback('bot', "Hey there! I'm Cosmos, your friendly space guide! 🌌 Ready to explore the universe together? Ask me anything about planets, stars, galaxies, or anything space-related!", true);
    }
  } catch (error) {
    console.error('Error loading chat history:', error);
    // Add welcome message even if loading fails
    if (addMessageToUICallback) {
      addMessageToUICallback('bot', "Hey there! I'm Cosmos, your friendly space guide! 🌌 Ready to explore the universe together? Ask me anything about planets, stars, galaxies, or anything space-related!", true);
    }
  }
}

// Call Google AI Studio (Gemini) API via backend
async function getGoogleAIResponse(userMessage) {
  try {
    // Build conversation history for context
    // Filter to ensure history starts with a user message (required by Google AI)
    let history = chatHistory.slice(-10);
    
    // Find first user message in history
    let firstUserIndex = -1;
    for (let i = 0; i < history.length; i++) {
      if (history[i].sender === 'user') {
        firstUserIndex = i;
        break;
      }
    }
    
    // Only include history starting from first user message
    if (firstUserIndex >= 0) {
      history = history.slice(firstUserIndex);
    } else {
      // No user messages found, use empty history
      history = [];
    }
    
    // Map to format for backend
    const historyForBackend = history.map(msg => ({
      sender: msg.sender,
      message: msg.message
    }));

    // Send request to backend
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        history: historyForBackend
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Extract response text
    if (data.generated_text) {
      return data.generated_text.trim();
    } else if (typeof data === 'string') {
      return data.trim();
    } else {
      console.error('Unexpected API response format:', data);
      return "I'm having trouble processing that. Could you rephrase?";
    }
  } catch (error) {
    console.error('Google AI API error:', error);
    
    // Check if it's a connection error (backend not running)
    if (USE_BACKEND && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
      return `❌ Backend server is not running! Please:
1. Open a terminal in your project folder
2. Run: npm start
3. Wait for "🚀 Chat API server running on http://localhost:3001"
4. Then try sending a message again`;
    }
    
    return `Sorry, I encountered an error: ${error.message}. Please try again.`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize 3D tilt effect
  add3DTiltEffect();
  
  console.log('Chat script loaded');
  
  // DOM Elements
  const chatToggle = document.getElementById('chat-toggle');
  const chatPanel = document.getElementById('chat-panel');
  const chatInput = document.getElementById('chat-text');
  const chatMessages = document.getElementById('chat-messages');
  const chatSend = document.getElementById('chat-send');

  // Initial state
  let isChatOpen = false;
  let isLoading = false;

  // Check authentication and load chat history
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUserId = user.uid;
      loadChatHistory();
    } else {
      // Try to get user ID from localStorage as fallback
      currentUserId = localStorage.getItem('loggedInUserId');
      if (currentUserId) {
        loadChatHistory();
      } else {
        addMessageToUI('bot', "Hey there! I'm Cosmos, your friendly space guide! 🌌 Ready to explore the universe together? Ask me anything about planets, stars, galaxies, or anything space-related!", false);
      }
    }
  });

  // Toggle chat panel
  chatToggle.addEventListener('click', (e) => {
    e.preventDefault();
    isChatOpen = !isChatOpen;
    if (isChatOpen) {
      chatPanel.classList.add('open');
      chatInput.focus();
      console.log('Chat opened');
    } else {
      chatPanel.classList.remove('open');
      console.log('Chat closed');
    }
  });

  // Store chatMessages element globally
  chatMessagesElement = chatMessages;

  // Add message to UI
  function addMessageToUI(sender, text, saveToFirestore = true) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    // Create a span for the sender label
    const senderLabel = document.createElement('span');
    senderLabel.className = 'message-sender';
    senderLabel.textContent = sender === 'bot' ? 'Cosmo: ' : 'You: ';
    
    // Create a span for the message text
    const messageText = document.createElement('span');
    messageText.className = 'message-text';
    messageText.textContent = text;
    
    // Add both elements to the message div
    messageDiv.appendChild(senderLabel);
    messageDiv.appendChild(messageText);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Save to Firestore if needed
    if (saveToFirestore) {
      saveMessageToFirestore(sender, text);
    }
  }

  // Set the callback so loadChatHistory can use it
  setAddMessageToUICallback(addMessageToUI);

  // Show loading indicator
  function showLoadingIndicator() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-indicator';
    loadingDiv.className = 'message bot-message';
    loadingDiv.innerHTML = '<span class="message-sender">Cosmo: </span><span class="message-text">Thinking...</span>';
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Remove loading indicator
  function removeLoadingIndicator() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.remove();
    }
  }

  // Send message function
  async function sendMessage() {
    const message = chatInput.value.trim();
    if (message === '' || isLoading) return;

    isLoading = true;
    chatSend.disabled = true;
    
    // Add user message to chat
    addMessageToUI('user', message);
    chatInput.value = '';
    
    // Show loading indicator
    showLoadingIndicator();

    try {
      // Get response from Google AI Studio (Gemini) API
      const response = await getGoogleAIResponse(message);
      
      // Remove loading indicator
      removeLoadingIndicator();
      
      // Add bot response
      addMessageToUI('bot', response);
    } catch (error) {
      removeLoadingIndicator();
      addMessageToUI('bot', `Sorry, I encountered an error: ${error.message}. Please try again.`);
    } finally {
      isLoading = false;
      chatSend.disabled = false;
      chatInput.focus();
    }
  }

  // Handle send button click
  chatSend.addEventListener('click', (e) => {
    e.preventDefault();
    sendMessage();
  });

  // Handle Enter key
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
});

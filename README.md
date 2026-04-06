# 🌿 SafeAI – Smart Voice-Based Safety Assistant

SafeAI is an intelligent voice-enabled safety chatbot designed especially for Indian users. It listens to the user, understands emotions, detects emergencies, and responds in a natural human-like way. It can also track live location and trigger alerts when needed.

---

## 🚀 Features

### 🎤 Voice Input (Speech-to-Text)
- User speaks instead of typing
- Uses browser Speech Recognition API
- Converts voice to text in real-time

---

### 🤖 AI Chatbot (Smart Response System)
- Uses LLM API (Groq / LLaMA)
- Understands:
  - Emotion (sad, normal, confused)
  - Intent (casual vs emergency)
- Responds like a real human friend

---

### 🌐 Language Adaptation
- Detects user language automatically:
  - Hindi → replies in Hindi (Devanagari)
  - English → replies in English
  - Hinglish → mix of Hindi and English
- Makes conversation feel natural

---

### 🧠 Memory (Personalization)
- Stores:
  - User name
  - Previous messages
- Uses last 10–12 chats for context
- Makes chatbot feel personal and not robotic

---

### 🚨 Emergency Detection System
- Detects keywords like:
  help, bachao, danger, unsafe, attack, scared
- Triggers:
  - Alert message
  - Emergency flow
  - Location tracking

---

### 🔔 Alert System (Safety Check)
- When emergency is detected:
  1. Asks “Are you safe?”
  2. Plays beep sound multiple times
  3. Waits for response
  4. If no response → triggers alarm

---

### 📍 Live Location Tracking
- Uses Geolocation API
- Tracks coordinates continuously
- Shows live map inside UI
- Sends location to backend

---

### 🗺️ Map Integration
- Uses Google Maps Embed
- Displays:
  - Current location
  - Live tracking during emergency
- Visible directly in chat section

---

### 🔊 Voice Output (Text-to-Speech)
- Converts AI response to speech
- Uses browser SpeechSynthesis API
- Supports Indian voice (if available)

---

### 🔄 Interrupt Feature
- If user speaks while bot is talking:
  - Bot stops immediately
  - Starts listening again

---

### 🧭 Tab-Based UI
- Chat tab 💬
- Location tab 📍
- Smooth switching like real apps

---

## 🛠️ Tech Stack

### 🌐 Frontend
- HTML
- CSS (modern UI with animations)
- JavaScript

### 🎤 Voice Features
- SpeechRecognition API (input)
- SpeechSynthesis API (output)

### 📍 Location
- Navigator Geolocation API
- Google Maps Embed API

### ⚙️ Backend
- Node.js
- Express.js

### 🤖 AI Integration
- Groq API (LLaMA 3 model)
- Axios for API calls

### 🔐 Environment
- dotenv for API keys

---

## ⚙️ How It Works (Step-by-Step)

### 1. User Speaks
- Mic button is clicked
- SpeechRecognition starts
- Voice is converted into text

---

### 2. Text Sent to Backend
POST /chat  
{
  "message": "User speech"
}

---

### 3. Backend Processing
- Detects emergency keywords
- Stores message in chat history
- Adds system prompt
- Sends request to AI model

---

### 4. AI Generates Response
- Based on:
  - User tone
  - Language
  - Chat history
- Returns short, human-like reply

---

### 5. Frontend Receives Response
- Displays text
- Converts it into speech

---

### 6. Emergency Handling (if triggered)
- Shows “Are you safe?” button
- Starts beep cycle (multiple times)
- Starts location tracking
- Displays live map

---

### 7. If No Response
- Alarm sound is triggered
- Location continues tracking

---

## 🔄 Flowchart

User Speaks 🎤  
↓  
Speech to Text  
↓  
Send to Backend (/chat)  
↓  
Check Emergency 🚨  
↓  
Send to AI Model 🤖  
↓  
Receive Reply  
↓  
Show and Speak Response 🔊  
↓  
If Emergency  
→ Show Alert Button  
→ Start Beep Cycle  
→ Start Location Tracking 📍  
→ Show Map  
↓  
If No Response  
→ Trigger Alarm 🚨  

---

## 📦 Project Structure

SafeAI/  
│  
├── frontend/  
│   ├── index.html  
│   ├── style.css  
│   ├── script.js  
│  
├── backend/  
│   ├── server.js  
│   ├── .env  
│  
└── README.md  

---

## 🔑 Environment Setup

Create a `.env` file:

GROQ_API_KEY=your_api_key_here

---

## ▶️ Run the Project

### Backend
cd backend  
npm install  
node server.js  

### Frontend
Open index.html in Chrome browser

---

## 🌟 Future Improvements
- Better Indian voice using Google TTS or Azure TTS
- Real-time alert to emergency contacts
- WhatsApp or SMS integration
- Database for long-term memory
- Mobile app version

---

## ❤️ Summary

SafeAI is not just a chatbot.  
It is a smart safety companion that:
- Listens like a friend  
- Understands emotions  
- Responds naturally  
- Detects danger  
- Helps in emergencies  
- Tracks location in real-time  

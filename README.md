# 🌿 SafeAI – Smart Voice-Based Safety Assistant

SafeAI is an intelligent voice-enabled safety chatbot designed especially for Indian users. It listens to the user, understands emotions, detects emergencies, and responds in a natural human-like way. It can also track live location and trigger emergency alerts when needed.

---

## 🎯 Objective

SafeAI aims to enhance personal safety by combining artificial intelligence, voice technology, and real-time monitoring into one reliable assistant. It helps users stay protected, connected, and supported during emergencies.

---

## 🚀 Features

### 🎤 Voice Input
- Users can speak instead of typing.
- Converts speech into text using the browser's Speech Recognition API.
- Real-time voice interaction.

### 🤖 AI Chatbot
- Uses **Groq API (LLaMA model)** for intelligent responses.
- Understands:
  - user emotion
  - user intent
  - emergency situations
- Responds like a caring human companion.

### 🌐 Language Adaptation
Supports:
- English
- Hindi
- Hinglish

Replies in the same language style as the user for natural conversation.

### 🧠 Personalized Memory
Stores:
- User name
- Recent conversation history

This helps maintain context and makes the assistant feel more human-like.

### 🚨 Emergency Detection
Detects emergency keywords such as:
- help
- danger
- unsafe
- scared
- attack
- bachao

If detected:
- emergency mode is activated
- live location tracking starts
- alert system begins

### 🔔 Safety Alert Flow
When emergency is detected:
1. Bot asks **"Are you safe?"**
2. Warning beep starts
3. Waits for user response
4. If no response, emergency alert is triggered

### 📍 Live Location Tracking
- Uses Geolocation API
- Tracks live coordinates
- Displays current location on Google Maps
- Sends coordinates to backend

### 📧 Emergency Email Alert
If the user does not respond:
- Sends alert email to emergency contacts
- Includes Google Maps live location link

### 🔊 Voice Output
Converts bot replies into voice using Speech Synthesis API.

### 🧭 Tab-Based Interface
Includes:
- **Chat Tab**
- **Location Tab**
- **Emergency Tab**

---

## 🛠️ Tech Stack

### Frontend
- HTML
- CSS
- JavaScript

### Voice APIs
- SpeechRecognition API
- SpeechSynthesis API

### Backend
- Node.js
- Express.js

### AI Integration
- Groq API
- Axios

### Location Services
- Geolocation API
- Google Maps Embed

### Email Alerts
- Nodemailer

### Environment Variables
- dotenv

---

## ⚙️ How It Works

### 1. Voice Input
User clicks the mic button and speaks.

### 2. Speech to Text
SpeechRecognition converts voice into text.

### 3. Send to Backend
The text is sent to backend:

```json
{
  "message": "User speech"
}
```

### 4. Emergency Detection
The backend checks if the message contains emergency keywords.

If detected:
- Emergency mode is activated
- Location tracking starts
- Alert flow begins

### 5. AI Response Generation
Backend sends conversation to Groq API and receives an AI-generated reply.

### 6. Voice Response
The bot:
- displays the reply
- speaks the reply aloud

### 7. Emergency Alert
If the user does not respond to safety prompts:
- alarm sound plays
- live location is fetched
- email alert is sent to emergency contacts

---

## 🔄 Emergency Flow

```text
User Speaks
    ↓
Speech to Text
    ↓
Send to Backend
    ↓
Check Emergency Keywords
    ↓
AI Generates Reply
    ↓
Bot Speaks Reply
    ↓
Emergency?
   / \
 Yes  No
  ↓
Ask "Are you safe?"
  ↓
No Response?
   / \
 Yes  No
  ↓
Track Location
  ↓
Send Email Alert
```

---

## 📁 Project Structure

```bash
SafeAI/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── backend/
│   ├── server.js
│   └── .env
│
└── README.md
```

---

## 🔑 Environment Setup

Create a `.env` file inside backend:

```env
GROQ_API_KEY=your_groq_api_key_here
```

---

## ▶️ Run the Project

### Backend

```bash
cd backend
npm install
node server.js
```

### Frontend
Open:

```bash
index.html
```

in the browser.

---

## 🌟 Future Improvements

- SMS alert integration
- WhatsApp emergency alerts
- Database for user profiles
- Mobile application
- Real-time emergency services integration

---

## ❤️ Summary

SafeAI is a smart AI-based safety assistant that:

- listens to the user
- understands emotions
- detects emergencies
- tracks live location
- alerts emergency contacts
- responds naturally using voice

It combines **AI + voice + live tracking + emergency alerts** into one personal safety solution.

---
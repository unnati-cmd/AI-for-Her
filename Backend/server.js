import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import nodemailer from "nodemailer";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// MEMORY
let chatHistory = [];
let userProfile = {
  name: null,
  mood: null
};

// Emergency contact info (temporary storage)
const emergencyContacts = [
  {
    name: "Richa",
    email: "richamaitry@gmail.com"
  },
  {
    name: "Naitik",
    email: "naitikchs16@gmail.com"
  },
  {
    name: "Unnati",
    email: "unnatiald@gmail.com"
  }
];

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "safeai.alert@gmail.com",
    pass: "biochdorjhaetgob"
  }
});

transporter.verify(function(error, success) {
  if (error) {
    console.log("Transporter Error:", error);
  } else {
    console.log("Email server is ready");
  }
});

// MAIN ROUTE
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    console.log("User Message:", userMessage);

    // Emergency detection
    const emergencyKeywords = [
      "help", "emergency", "bachao", "peecha", "danger", "unsafe", "madad", "darr", "pareshani", "jabardasti", "trapped", 
      "attack", "save me", "scared", "follow", "kidnap", "help me","please help","i am scared","someone is following me","save me","i am in danger"
    ];

    const isEmergency = emergencyKeywords.some(word =>
      userMessage.toLowerCase().includes(word)
    );

    // Extract name (basic logic)
    if (!userProfile.name) {
      const match = userMessage.match(/my name is (\w+)/i);
      if (match) {
        userProfile.name = match[1];
      }
    }

    // Save user message
    chatHistory.push({
      role: "user",
      content: userMessage
    });

    // Keep only last 12 messages
    const recentHistory = chatHistory.slice(-12);

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `
You are an intelligent AI safety assistant designed for Indian users.

Your behavior rules:

1.LANGUAGE ADAPTATION:
- Detect the language of the user’s message.
- If user speaks in Hindi → reply in simple Hindi (Devanagari script).
- If user speaks in English → reply in simple English.
- If user speaks in Hinglish → reply in a natural mix of Hindi (Devanagari script) + English words.
- In Hinglish responses:
  - Use Hindi script for emotions and common phrases.
  - Use English words where commonly used in daily speech.
  - Example style: "तुम tension मत लो, everything will be fine"
- Always match the user’s language style and tone.
- Do not force pure Hindi or pure English if user is mixing.
- Keep the response natural, short and easy to understand.
Examples:
- User: "मुझे डर लग रहा है" → Reply in Hindi
- User: "I am scared" → Reply in English
- User: "Mujhe thoda stress ho raha hai" → Reply in Hinglish like:
  "तुम stress मत लो, I’m here with you".
  
2. Keep replies very short and clear. Maximum 1 to 2 lines.
3. Sound like a real caring human friend, not a bot.

4. Always understand the user’s tone before replying:
- If normal, reply casually
- If sad or stressed, reply with empathy and calm tone
- If confused, explain simply and clearly

5. PERSONALIZATION:
- If you do not know the user’s name, politely ask their name in a natural way
- If you know the name, use it sometimes but do not overuse
- Occasionally ask simple short human questions like:
  Aaj ka din kaisa tha
  Sab theek chal raha hai na

6. CONVERSATION STYLE:
- Use simple words and natural fillers like acha, arre, hmm when suitable
- Do not sound formal or robotic
- Avoid long explanations
- Keep it interactive, not one sided

7. EMERGENCY DETECTION:
If user says things like help, bachao, danger, unsafe, someone is following me, scared, attack, save me

Then:
- Suggest to call the police and give their contact number
- give very short, crisp and to the point reply
- Treat it as serious emergency
- Respond urgently but calmly
- Tell user to go to a safe place immediately
- Suggest calling a trusted person or nearby help
- Stay supportive and present

8. NEVER ignore emergency signals and give all the emergency and nearby police station's contact details.

9. DO NOT:
- Do not give long paragraphs
- Do not use difficult English words
- Do not sound like a chatbot

10. TONE EXAMPLES:
- Normal: Haan bolo kya hua
- Friendly: Arre chill main hoon na
- Supportive: Samajh aa raha hai mujhe, tension mat le
- Emergency: Abhi safe jagah pe jao aur kisi trusted person ko call karo

Act like a real human friend who genuinely cares about the user’s safety and well being.
`
          },
          ...recentHistory
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply = response.data.choices[0].message.content;

    // Save bot reply
    chatHistory.push({
      role: "assistant",
      content: reply
    });

    res.json({
      reply,
      emergency: isEmergency
    });

  } catch (error) {
    console.log("BACKEND FULL ERROR:");
    console.log(error.response?.data || error.message);

    res.json({ reply: "Backend error aa gaya" });
  }
});

// ADD HERE (LOCATION ROUTE)
app.post("/location", (req, res) => {
  const { latitude, longitude } = req.body;

  console.log("📍 User Location:", latitude, longitude);

  const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
  console.log("🗺️ Map Link:", mapLink);

  res.json({ status: "Location received" });
});



app.post("/send-alert", async (req, res) => {
  try {
    console.log("SEND ALERT ROUTE HIT");
    const { latitude, longitude } = req.body;

    const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

    const mailOptions = {
      from: "safeai.alert@gmail.com",
      to: emergencyContacts.map(contact => contact.email).join(","),
      subject: "🚨 Emergency Alert from SafeAI",
      text: `
Emergency detected!

User may be in danger.
Live Location:
${mapLink}

Please check immediately.
      `
    };

    await transporter.sendMail(mailOptions);

    console.log("✅ Emergency email sent");
    res.json({ success: true });

  } catch (error) {
    console.log("Email Full Error:", error);
    res.json({ success: false });
  }
});

app.get("/emergency-contact", (req, res) => {
  try {
    res.json(emergencyContacts);
  } catch (error) {
    console.log("Emergency contact route error:", error);
    res.status(500).json({ error: "Failed to load contact" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
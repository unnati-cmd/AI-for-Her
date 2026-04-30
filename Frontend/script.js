let watchId = null;
let beepCount = 0;
let beepInterval = null;
const chatMapContainer = document.getElementById("chatMapContainer");
const chatMapFrame = document.getElementById("chatMapFrame");
const mapContainer = document.getElementById("mapContainer");
const mapFrame = document.getElementById("mapFrame");

const chatTab = document.getElementById("chatTab");
const locationTab = document.getElementById("locationTab");
const emergencyTab = document.getElementById("emergencyTab");

const chatSection = document.getElementById("chatSection");
const locationSection = document.getElementById("locationSection");
const emergencySection = document.getElementById("emergencySection");
let waitingForSafetyResponse = false;

window.speechSynthesis.onvoiceschanged = () => {
  window.speechSynthesis.getVoices();
};

const startBtn = document.getElementById("startBtn");
const userTextDiv = document.getElementById("userText");
const botTextDiv = document.getElementById("botText");
const safeBtn = document.getElementById("safeBtn");

let isListening = false;
let isSpeaking = false;

startBtn.addEventListener("click", startAssistant);

function speak(text) {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  let voices = window.speechSynthesis.getVoices();
  const indianVoice =
    voices.find(v => v.lang === "en-IN") ||
    voices.find(v => v.lang === "hi-IN") ||
    voices.find(v => v.name.toLowerCase().includes("google")) ||
    voices.find(v => v.name.toLowerCase().includes("male")) ||
    voices[0];
  utterance.voice = indianVoice;
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}

safeBtn.addEventListener("click", () => {
  clearInterval(beepInterval);
  beepCount = 0;
  window.speechSynthesis.cancel();
  safeBtn.style.display = "none";
  stopLocationTracking();
  chatMapContainer.style.display = "none";
  botTextDiv.innerHTML += "<br>✅ Thank God, you are safe.";
  speak("Thank God, you are safe.");
});

function startLocationTracking() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      console.log("📍 Live Location:", lat, lon);

      // SHOW MAP IN CHAT
      chatMapContainer.style.display = "block";

      const mapURL = `https://www.google.com/maps?q=${lat},${lon}&z=15&output=embed`;
      chatMapFrame.src = mapURL;

      // send to backend (optional)
      fetch("http://localhost:5000/location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          latitude: lat,
          longitude: lon
        })
      });
    },
    (error) => {
      console.log("Location error:", error.message);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000
    }
  );
}

function switchTab(active) {
  chatSection.style.display = "none";
  locationSection.style.display = "none";
  emergencySection.style.display = "none";

  chatTab.classList.remove("active");
  locationTab.classList.remove("active");
  emergencyTab.classList.remove("active");

  if (active === "chat") {
    chatSection.style.display = "block";
    chatTab.classList.add("active");
  }

  if (active === "location") {
    locationSection.style.display = "block";
    locationTab.classList.add("active");
  }

  if (active === "emergency") {
    emergencySection.style.display = "block";
    emergencyTab.classList.add("active");
  }
}

chatTab.addEventListener("click", () => {
  console.log("Chat clicked");
  switchTab("chat");
});

locationTab.addEventListener("click", () => {
  console.log("Location clicked");
  switchTab("location");
  showCurrentLocation();
});

emergencyTab.addEventListener("click", () => {
  console.log("Emergency clicked");
  switchTab("emergency");
  loadEmergencyContact();
});

// START LISTENING
function startAssistant() {
  // Stop bot if speaking (interrupt)
  window.speechSynthesis.cancel();
  isSpeaking = false;
  if (isListening) return;
  isListening = true;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Use Chrome browser");
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.start();
  userTextDiv.innerHTML = "🎧 Listening...";
  recognition.onresult = async function (event) {
    if (!event.results[0].isFinal) return;
    try {
      const speech = event.results[0][0].transcript;
      if (waitingForSafetyResponse) {
        const reply = speech.toLowerCase();

        if (reply.includes("i am safe") || reply.includes("safe")) {
          clearInterval(beepInterval);
          waitingForSafetyResponse = false;
          stopLocationTracking();

          botTextDiv.innerHTML += "<br>✅ Thank God, you are safe.";
          speak("Thank God, you are safe.");
          return;
        }
      }
      recognition.stop();
      isListening = false;
      userTextDiv.innerHTML = "🧑 " + speech;
      botTextDiv.innerHTML = "🤖 Thinking...";
      // Backend call
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: speech })
      });
      const data = await response.json();
      const reply = (data.reply || "No response").replace(/\s+/g, " ").trim();      
      botTextDiv.innerHTML = "🤖 " + reply;
      speak(reply);
      // Emergency detected
      if (data.emergency) {
        handleEmergency();
        startLocationTracking();
      }
    } catch (error) {
      console.log("Frontend Error:", error.message);
      botTextDiv.innerHTML = "❌ Error";
      isListening = false;
    }
  };
  recognition.onerror = function () {
    botTextDiv.innerHTML = "❌ Mic error";
    isListening = false;
  };
  recognition.onend = function () {
    isListening = false;
  // restart listening automatically
    setTimeout(() => {
      startAssistant();
    }, 1000);
  };
}


// HANDLE EMERGENCY
function handleEmergency() {
  waitingForSafetyResponse = true;
  safeBtn.style.display = "block";
  botTextDiv.innerHTML += "<br>⚠️ Are you safe? Please respond.";
  beepCount = 0;
  beepInterval = setInterval(() => {
    beepCount++;
    botTextDiv.innerHTML += `<br>⚠️ Attempt ${beepCount}: Are you safe?`;
    // play beep
    const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
    audio.volume = 1.0;
    audio.play();
    // show location in chat
    chatMapContainer.style.display = "block";
    if (beepCount >= 5) {
      clearInterval(beepInterval);
      triggerAlarm();
    }
  }, 3000); // every 3 seconds
}

// ASK AGAIN
function askAgain() {
  botTextDiv.innerHTML += "<br>⚠️ Please respond NOW! Are you safe?";
  playBeep(); // repeated warning sound
}

// FINAL ALERT
function triggerAlarm() {
  waitingForSafetyResponse = false;
  safeBtn.style.display = "none";
  botTextDiv.innerHTML += "<br>🚨 EMERGENCY ALERT TRIGGERED!";

  const alarm = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");
  alarm.loop = false;
  alarm.volume = 1.0;
  alarm.play();

  navigator.geolocation.getCurrentPosition((position) => {
    fetch("http://localhost:5000/send-alert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      })
    })
    .then(res => res.json())
    .then(data => {
      console.log("Email alert sent:", data);
    })
    .catch(err => {
      console.log("Email alert failed:", err);
    });
  });

  startLocationTracking();
}


// SOUND FUNCTION
function playBeep(isAlarm = false) {
  const soundUrl = isAlarm
    ? "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"
    : "https://actions.google.com/sounds/v1/alarms/beep_short.ogg";
  let count = 0;
  const interval = setInterval(() => {
    const audio = new Audio(soundUrl);
    audio.volume = 1.0; // 🔊 full volume
    audio.play();
    count++;
    // Repeat sound multiple times
    if (count >= (isAlarm ? 8 : 5)) {
      clearInterval(interval);
    }
  }, isAlarm ? 800 : 1000);
}

function showCurrentLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const mapURL = `https://www.google.com/maps?q=${lat},${lon}&z=15&output=embed`;
      if (mapFrame) {
        mapFrame.src = mapURL;
      } else {
        console.log("mapFrame not found");
      }
    },
    (error) => {
      console.log("Location permission denied", error);
      alert("Location permission denied");
    }
  );
}

function stopLocationTracking() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
    console.log("🛑 Location tracking stopped");
  }
}

function loadEmergencyContact() {
  fetch("http://localhost:5000/emergency-contact")
    .then(res => res.json())
    .then(data => {
      const emergencySection = document.getElementById("emergencySection");

      emergencySection.innerHTML = `
        <h2>🚨 Emergency Contacts</h2>
      `;

      data.forEach(contact => {
        emergencySection.innerHTML += `
          <p><strong>Name:</strong> ${contact.name}</p>
          <p><strong>Email:</strong> ${contact.email}</p>
          <hr>
        `;
      });
    })
    .catch(err => {
      console.log("Failed to load emergency contacts", err);
    });
}

window.onload = () => {
  startAssistant();
};
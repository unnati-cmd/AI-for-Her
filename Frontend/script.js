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

const beepSound = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
beepSound.volume = 1.0;
const alarmSound = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");
alarmSound.volume = 1.0;

let recognition = null;

window.speechSynthesis.onvoiceschanged = () => {
  window.speechSynthesis.getVoices();
};

const startBtn = document.getElementById("startBtn");
const userTextDiv = document.getElementById("userText");
const botTextDiv = document.getElementById("botText");
const safeBtn = document.getElementById("safeBtn");

let isListening = false;
let isSpeaking = false;


let audioUnlocked = false;
function unlockAudio() {
  if (audioUnlocked) return;

  const dummy = new Audio();
  dummy.src = "https://actions.google.com/sounds/v1/alarms/beep_short.ogg";
  dummy.volume = 0;
  dummy.play().then(() => {
    dummy.pause();
    audioUnlocked = true;
    console.log("🔓 Audio unlocked");
  }).catch(() => {});
}

startBtn.addEventListener("click", startAssistant);

function speak(text) {
  if (!window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  const voices = speechSynthesis.getVoices();
  utterance.voice =
    voices.find(v => v.lang === "en-IN") ||
    voices.find(v => v.lang === "hi-IN") ||
    voices[0];

  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;

  isSpeaking = true;

  utterance.onend = () => {
    isSpeaking = false;
  };

  speechSynthesis.speak(utterance);
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
  // if (isListening || isSpeaking) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Use Chrome browser");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.continuous = false;
  recognition.interimResults = false;

  isListening = true;
  userTextDiv.innerHTML = "🎧 Listening...";
  recognition.start();

  recognition.onresult = async function (event) {
    // 🔥 INTERRUPT BOT SPEECH
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      isSpeaking = false;
      console.log("🛑 Bot interrupted by user");
    }

    const speech = event.results[0][0].transcript;

    recognition.stop();
    isListening = false;

    userTextDiv.innerHTML = "🧑 " + speech;

    // ✅ SAFETY RESPONSE CHECK
    if (waitingForSafetyResponse) {
      const reply = speech.toLowerCase();

      if (reply.includes("safe")) {
        clearInterval(beepInterval);
        waitingForSafetyResponse = false;
        stopLocationTracking();

        botTextDiv.innerHTML += "<br>✅ Thank God, you are safe.";
        speak("Thank God, you are safe.");
        return;
      }
    }

    botTextDiv.innerHTML = "🤖 Thinking...";

    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: speech })
      });

      const data = await res.json();
      const reply = data.reply;

      botTextDiv.innerHTML = "🤖 " + reply;

      // 🔥 SPEAK FIRST, THEN RESTART MIC
      speak(reply);

      if (data.emergency) {
        handleEmergency();
        startLocationTracking();
      }

    } catch (err) {
      botTextDiv.innerHTML = "❌ Error";
    }
  };

  recognition.onerror = function () {
    botTextDiv.innerHTML = "❌ Mic error";
    isListening = false;
  };

  recognition.onend = function () {
    isListening = false;
    setTimeout(() => {
    startAssistant();
    }, 300);
  }
};


// HANDLE EMERGENCY
function handleEmergency() {
  waitingForSafetyResponse = true;
  safeBtn.style.display = "block";
  botTextDiv.innerHTML += "<br>⚠️ Are you safe? Please respond.";
  beepCount = 0;
  beepInterval = setInterval(() => {
    beepCount++;
    botTextDiv.innerHTML += `<br>⚠️ Attempt ${beepCount}: Are you safe?`;
    beepSound.currentTime = 0;
    beepSound.play().catch(err => console.log("Beep error:", err));
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
  alarmSound.currentTime = 0;
  alarmSound.play().catch(() => {});
  waitingForSafetyResponse = false;
  safeBtn.style.display = "none";
  botTextDiv.innerHTML += "<br>🚨 EMERGENCY ALERT TRIGGERED!";

  alarmSound.currentTime = 0;
  alarmSound.play().catch(err => console.log("Alarm error:", err));

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

document.body.addEventListener("click", unlockAudio, { once: true });
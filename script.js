/***********************
 * THINGSPEAK SETTINGS
 ***********************/
const CHANNEL_ID = "3230579";
const READ_API_KEY = "H3GVTTPQ8L2E4JZ7";
const WRITE_API_KEY = "MA66FX2SMGCQA7XW";

const READ_URL =
  `https://api.thingspeak.com/channels/${CHANNEL_ID}/fields/1.json?api_key=${READ_API_KEY}&results=1`;

const WRITE_URL =
  `https://api.thingspeak.com/update?api_key=${WRITE_API_KEY}`;

/***********************
 * RATE LIMIT CONTROL
 ***********************/
let buttonsLocked = false;
const LOCK_TIME = 20000; // 20 seconds

function lockButtons() {
  buttonsLocked = true;

  document.querySelectorAll("button").forEach(btn => {
    btn.disabled = true;
    btn.style.opacity = "0.6";
    btn.style.cursor = "not-allowed";
  });

  setTimeout(() => {
    buttonsLocked = false;
    document.querySelectorAll("button").forEach(btn => {
      btn.disabled = false;
      btn.style.opacity = "1";
      btn.style.cursor = "pointer";
    });
  }, LOCK_TIME);
}

/***********************
 * READ SOIL MOISTURE
 ***********************/
async function loadMoisture() {
  try {
    const response = await fetch(READ_URL);
    const data = await response.json();

    if (data.feeds.length > 0) {
      const value = data.feeds[0].field1;
      if (value !== null) {
        updateMoistureUI(parseInt(value));
      }
    }
  } catch (error) {
    console.error("Failed to read ThingSpeak:", error);
  }
}

function updateMoistureUI(value) {
  const moistureText = document.getElementById("moisture");
  const moistureFill = document.getElementById("moisture-fill");

  moistureText.innerText = value + "%";
  moistureFill.style.width = value + "%";

  if (value < 30) {
    moistureFill.style.background = "#e53935";
  } else if (value < 60) {
    moistureFill.style.background = "#fbc02d";
  } else {
    moistureFill.style.background = "#43a047";
  }
}

/***********************
 * PUMP CONTROL
 ***********************/
async function sendPumpCommand(value) {
  if (buttonsLocked) {
    alert("Please wait 20 seconds between commands (ThingSpeak limit)");
    return;
  }

  try {
    await fetch(`${WRITE_URL}&field2=${value}`);
    lockButtons();

    if (value === 0) updatePumpStatus("OFF");
    if (value === 1) updatePumpStatus("ON");
    if (value === 2) updatePumpStatus("AUTO");

  } catch (error) {
    console.error("Failed to send pump command:", error);
  }
}

function pumpOn() {
  sendPumpCommand(1);
}

function pumpOff() {
  sendPumpCommand(0);
}

function pumpAuto() {
  sendPumpCommand(2);
}

function updatePumpStatus(state) {
  const pumpStatus = document.getElementById("pump-status");
  pumpStatus.innerText = state;

  pumpStatus.className =
    state === "ON" ? "status-value pump-on" :
    state === "OFF" ? "status-value pump-off" :
    "status-value mode-auto";
}

/***********************
 * AUTO REFRESH
 ***********************/
loadMoisture();
setInterval(loadMoisture, 20000);

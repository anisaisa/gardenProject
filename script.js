/***********************
 * THINGSPEAK SETTINGS
 ***********************/
const CHANNEL_ID = "3230579";
const READ_API_KEY = "H3GVTTPQ8L2E4JZ7";
const WRITE_API_KEY = "MA66FX2SMGCQA7XW";

// URLs
const READ_URL =
  `https://api.thingspeak.com/channels/${CHANNEL_ID}/fields/1.json?api_key=${READ_API_KEY}&results=1`;

const WRITE_URL =
  `https://api.thingspeak.com/update?api_key=${WRITE_API_KEY}`;

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

  // Color logic
  if (value < 30) {
    moistureFill.style.background = "#e53935"; // red
  } else if (value < 60) {
    moistureFill.style.background = "#fbc02d"; // yellow
  } else {
    moistureFill.style.background = "#43a047"; // green
  }
}

/***********************
 * PUMP CONTROL
 ***********************/
async function pumpOn() {
  await sendPumpCommand(1);
  updatePumpStatus("ON");
}

async function pumpOff() {
  await sendPumpCommand(0);
  updatePumpStatus("OFF");
}

async function sendPumpCommand(value) {
  try {
    await fetch(`${WRITE_URL}&field2=${value}`);
  } catch (error) {
    console.error("Failed to send pump command:", error);
  }
}

function updatePumpStatus(state) {
  const pumpStatus = document.getElementById("pump-status");
  pumpStatus.innerText = state;

  pumpStatus.className = "status-value " +
    (state === "ON" ? "pump-on" : "pump-off");
}

/***********************
 * AUTO REFRESH
 ***********************/
loadMoisture();
setInterval(loadMoisture, 20000); // ThingSpeak rate limit

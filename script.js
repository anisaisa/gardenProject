const CHANNEL_ID = "3230579";
const WRITE_API_KEY = "MA66FX2SMGCQA7XW"; // write key
const FIELD_MOISTURE = 1;
const FIELD_PUMP = 2;

async function fetchData() {
  const res = await fetch(
    `https://api.thingspeak.com/channels/${2345678}/feeds/last.json`
  );
  const data = await res.json();

  const moisture = data.field1 || 0;
  const pump = data.field2 || 0;

  document.getElementById("moisture").innerText = moisture + "%";
  document.getElementById("bar-fill").style.width = moisture + "%";

  const pumpStatus = document.getElementById("pump-status");
  pumpStatus.innerText = pump === "1" ? "ON" : "OFF";
  pumpStatus.className = pump === "1" ? "on" : "off";
}

function pumpOn() {
  fetch(`https://api.thingspeak.com/update?api_key=${MA66FX2SMGCQA7XW}&field2=1`);
}

function pumpOff() {
  fetch(`https://api.thingspeak.com/update?api_key=${MA66FX2SMGCQA7XW}&field2=0`);
}

setInterval(fetchData, 20000);
fetchData();


const WRITE_API_KEY = "MA66FX2SMGCQA7XW"; // ThingSpeak write key
const FIELD_PUMP = 2;

// Update pump status from ThingSpeak
async function updatePumpStatus() {
  const res = await fetch(
    `https://api.thingspeak.com/channels/3230579/fields/${FIELD_PUMP}/last.json`
  );
  const data = await res.json();

  const statusEl = document.getElementById("pump-status");
  if (!statusEl) return;

  if (data.field2 === "1") {
    statusEl.textContent = "ON";
    statusEl.className = "status-value pump-on";
  } else {
    statusEl.textContent = "OFF";
    statusEl.className = "status-value pump-off";
  }
}

// Button actions
function pumpOn() {
  fetch(`https://api.thingspeak.com/update?api_key=${WRITE_API_KEY}&field2=1`);
}

function pumpOff() {
  fetch(`https://api.thingspeak.com/update?api_key=${WRITE_API_KEY}&field2=0`);
}

// Refresh pump status
setInterval(updatePumpStatus, 20000);
updatePumpStatus();

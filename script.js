/***********************
 * THINGSPEAK SETTINGS
 ***********************/
const CHANNEL_ID = "3230579";
const READ_API_KEY = "H3GVTTPQ8L2E4JZ7";
const WRITE_API_KEY = "MA66FX2SMGCQA7XW";

const READ_URL = `https://api.thingspeak.com/channels/${CHANNEL_ID}/fields/1.json?api_key=${READ_API_KEY}&results=1`;
const WRITE_URL = `https://api.thingspeak.com/update?api_key=${WRITE_API_KEY}`;

/***********************
 * WATER DROPLET ANIMATION
 ***********************/
let dropletsActive = false;
let dropletInterval = null;

function createDroplet() {
  const droplet = document.createElement('div');
  droplet.className = 'droplet';
  droplet.style.left = Math.random() * 100 + '%';
  droplet.style.animationDuration = (Math.random() * 2 + 2) + 's';
  
  document.getElementById('droplets').appendChild(droplet);
  
  setTimeout(() => droplet.remove(), 4000);
}

function startDroplets() {
  if (!dropletsActive) {
    dropletsActive = true;
    dropletInterval = setInterval(createDroplet, 150);
  }
}

function stopDroplets() {
  if (dropletsActive) {
    dropletsActive = false;
    clearInterval(dropletInterval);
  }
}

/***********************
 * CIRCULAR GAUGE UPDATE
 ***********************/
function updateGauge(value) {
  const circle = document.getElementById('gauge-circle');
  const gaugeValue = document.getElementById('gauge-value');
  const circumference = 502.65;
  const offset = circumference - (value / 100) * circumference;
  
  circle.style.strokeDashoffset = offset;
  gaugeValue.textContent = value + '%';
}

/***********************
 * SOIL VISUALIZATION
 ***********************/
function updateSoilViz(value) {
  const soilDry = document.getElementById('soil-dry');
  const soilWet = document.getElementById('soil-wet');
  const soilStatus = document.getElementById('soil-status');
  
  soilWet.style.height = value + '%';
  soilDry.style.height = (100 - value) + '%';
  
  if (value < 30) {
    soilStatus.textContent = '🔥 Dry Soil - Needs Water';
    soilStatus.style.color = '#ef4444';
  } else if (value < 60) {
    soilStatus.textContent = '💧 Moderate Moisture';
    soilStatus.style.color = '#fbbf24';
  } else {
    soilStatus.textContent = '✅ Well Hydrated';
    soilStatus.style.color = '#10b981';
  }
}

/***********************
 * PLANT HEALTH INDICATOR
 ***********************/
function updatePlantHealth(value) {
  const plantIcon = document.getElementById('plant-icon');
  const plantStatus = document.getElementById('plant-status');
  
  if (value < 30) {
    plantIcon.textContent = '🥀';
    plantIcon.style.color = '#ef4444';
    plantStatus.textContent = 'Needs Water!';
    plantStatus.style.color = '#ef4444';
    startDroplets(); // Start water droplets
  } else if (value < 60) {
    plantIcon.textContent = '🌿';
    plantIcon.style.color = '#fbbf24';
    plantStatus.textContent = 'Growing Well';
    plantStatus.style.color = '#fbbf24';
    stopDroplets();
  } else {
    plantIcon.textContent = '🌳';
    plantIcon.style.color = '#10b981';
    plantStatus.textContent = 'Thriving!';
    plantStatus.style.color = '#10b981';
    stopDroplets();
  }
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
        const moisture = parseInt(value);
        updateMoistureUI(moisture);
        updateGauge(moisture);
        updateSoilViz(moisture);
        updatePlantHealth(moisture);
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
    moistureFill.style.background = "linear-gradient(90deg, #ef4444, #dc2626)";
  } else if (value < 60) {
    moistureFill.style.background = "linear-gradient(90deg, #fbbf24, #f59e0b)";
  } else {
    moistureFill.style.background = "linear-gradient(90deg, #10b981, #059669)";
  }
}

/***********************
 * AUTO REFRESH
 ***********************/
loadMoisture();
setInterval(loadMoisture, 20000);
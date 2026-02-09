/***********************
 * THINGSPEAK SETTINGS
 ***********************/
const CHANNEL_ID = "3230579";
const READ_API_KEY = "H3GVTTPQ8L2E4JZ7";

const READ_URL = `https://api.thingspeak.com/channels/${CHANNEL_ID}/fields/1.json?api_key=${READ_API_KEY}&results=1`;

/***********************
 * AI RECOMMENDATION
 ***********************/
fetch("http://34.65.254.60:5000/recommendation")
  .then(response => response.json())
  .then(data => {
    document.getElementById("summary").innerText = data.summary;
    document.getElementById("recommendation").innerText = data.recommendation;
  })
  .catch(error => {
    console.error("AI fetch failed:", error);
    document.getElementById("recommendation").innerText =
      "Failed to load AI recommendation";
  });

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
 * GAUGE + SOIL + PLANT
 ***********************/
function updateGauge(value) {
  const circle = document.getElementById('gauge-circle');
  const gaugeValue = document.getElementById('gauge-value');
  const circumference = 502.65;
  const offset = circumference - (value / 100) * circumference;
  circle.style.strokeDashoffset = offset;
  gaugeValue.textContent = value + '%';
}

function updateSoilViz(value) {
  const soilWet = document.getElementById('soil-wet');
  const soilStatus = document.getElementById('soil-status');
  const plantGrowth = document.getElementById('plant-growth');

  soilWet.style.height = value + '%';

  if (value < 30) {
    plantGrowth.style.transform = 'translateX(-50%) scale(0.6)';
    soilStatus.textContent = '🔥 Dry Soil - Needs Water';
    soilStatus.style.color = '#ef4444';
  } else if (value < 60) {
    plantGrowth.style.transform = 'translateX(-50%) scale(0.85)';
    soilStatus.textContent = '💧 Moderate Moisture';
    soilStatus.style.color = '#fbbf24';
  } else {
    plantGrowth.style.transform = 'translateX(-50%) scale(1)';
    soilStatus.textContent = '✅ Well Hydrated';
    soilStatus.style.color = '#10b981';
  }
}

function updatePlantHealth(value) {
  const plantIcon = document.getElementById('plant-icon');
  const plantStatus = document.getElementById('plant-status');

  if (value < 30) {
    plantIcon.textContent = '🥀';
    plantStatus.textContent = 'Needs Water!';
    startDroplets();
  } else if (value < 60) {
    plantIcon.textContent = '🌿';
    plantStatus.textContent = 'Growing Well';
    stopDroplets();
  } else {
    plantIcon.textContent = '🌳';
    plantStatus.textContent = 'Thriving!';
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
      const value = parseInt(data.feeds[0].field1);
      updateGauge(value);
      updateSoilViz(value);
      updatePlantHealth(value);
      document.getElementById("moisture").innerText = value + "%";
      document.getElementById("moisture-fill").style.width = value + "%";
    }
  } catch (error) {
    console.error("ThingSpeak error:", error);
  }
}

/***********************
 * AUTO REFRESH
 ***********************/
loadMoisture();
setInterval(loadMoisture, 20000);

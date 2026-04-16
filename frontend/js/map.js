// =============================================
// MAP.JS — Controls the pothole map page
// =============================================

// ─────────────────────────────────────────────
// 1. CREATE THE MAP
// ─────────────────────────────────────────────

// Initialize Leaflet map
// setView([lat, lng], zoomLevel)
// Starting view: Mumbai, India
const map = L.map('map').setView([19.0760, 72.8777], 12);

// Add OpenStreetMap tiles (the actual map graphics)
// This is 100% free — no API key needed!
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19,
}).addTo(map);

// ─────────────────────────────────────────────
// 2. CUSTOM MAP PINS
// Different colored pins for different statuses
// ─────────────────────────────────────────────

// This function creates a colored circle pin
function createPin(color) {
  return L.divIcon({
    // HTML for the pin — a colored circle with a border
    html: `<div style="
      width: 18px;
      height: 18px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    "></div>`,
    className: '', // Remove default Leaflet styles
    iconSize: [18, 18],
    iconAnchor: [9, 9],   // Center of the pin
    popupAnchor: [0, -12] // Where popup appears relative to pin
  });
}

// Create 3 different colored pins
const pins = {
  'pending':     createPin('#e74c3c'), // Red
  'in-progress': createPin('#f39c12'), // Orange
  'fixed':       createPin('#27ae60'), // Green
};

// ─────────────────────────────────────────────
// 3. LOAD POTHOLES FROM BACKEND
// Fetches all reports and places pins on map
// ─────────────────────────────────────────────

// Store all markers so we can clear them on refresh
let allMarkers = [];

async function loadPotholes() {

  // Show loading message
  document.getElementById('mapLoading').style.display = 'block';

  // Clear existing markers from map
  allMarkers.forEach(marker => map.removeLayer(marker));
  allMarkers = [];

  try {
    // Fetch all potholes from our backend API
    const response = await fetch('https://pothole-backend-9j2l.onrender.com/api/potholes');
    const result = await response.json();

    // Hide loading message
    document.getElementById('mapLoading').style.display = 'none';

    const potholes = result.data;

    // Update stats bar
    updateStats(potholes);

    // If no potholes yet, show message on map
    if (potholes.length === 0) {
      document.getElementById('totalCount').textContent = '0 (No reports yet)';
      return;
    }

    // Loop through each pothole and add a pin
    potholes.forEach(pothole => {
      addPotholePin(pothole);
    });

    // Fit map to show all pins
    if (allMarkers.length > 0) {
      const group = L.featureGroup(allMarkers);
      map.fitBounds(group.getBounds().pad(0.1));
    }

  } catch (error) {
    // Hide loading
    document.getElementById('mapLoading').style.display = 'none';
    document.getElementById('totalCount').textContent = 'Error loading';
    console.error('Error loading potholes:', error);
    alert('❌ Could not load potholes. Is your server running?');
  }
}

// ─────────────────────────────────────────────
// 4. ADD A SINGLE PIN TO THE MAP
// ─────────────────────────────────────────────
function addPotholePin(pothole) {

  // Choose pin color based on status
  const pin = pins[pothole.status] || pins['pending'];

  // Format the date nicely
  const date = new Date(pothole.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Create the popup HTML
  // This shows when user clicks a pin
  const popupHTML = `
    <div class="pothole-popup">

      <!-- Pothole photo -->
      <img 
        src="${pothole.imageUrl}" 
        alt="Pothole"
        onerror="this.src='https://via.placeholder.com/220x130?text=No+Image'"
      />

      <!-- Description -->
      <h3>🚧 ${pothole.description}</h3>

      <!-- Coordinates -->
      <p>📍 ${pothole.latitude.toFixed(4)}, ${pothole.longitude.toFixed(4)}</p>

      <!-- Date reported -->
      <p>📅 Reported: ${date}</p>

      <!-- Status badge -->
      <span class="popup-status status-${pothole.status}">
        ${getStatusLabel(pothole.status)}
      </span>
    </div>
  `;

  // Place the marker on the map
  const marker = L.marker(
    [pothole.latitude, pothole.longitude],
    { icon: pin }
  )
  .addTo(map)
  .bindPopup(popupHTML, {
    maxWidth: 240,
    className: 'custom-popup'
  });

  // Save marker reference so we can remove it later
  allMarkers.push(marker);
}

// ─────────────────────────────────────────────
// 5. UPDATE STATS BAR
// Shows counts at the top of the page
// ─────────────────────────────────────────────
function updateStats(potholes) {
  const total    = potholes.length;
  const pending  = potholes.filter(p => p.status === 'pending').length;
  const progress = potholes.filter(p => p.status === 'in-progress').length;
  const fixed    = potholes.filter(p => p.status === 'fixed').length;

  document.getElementById('totalCount').textContent   = total;
  document.getElementById('pendingCount').textContent  = pending;
  document.getElementById('progressCount').textContent = progress;
  document.getElementById('fixedCount').textContent    = fixed;
}

// ─────────────────────────────────────────────
// 6. HELPER — Get readable status label
// ─────────────────────────────────────────────
function getStatusLabel(status) {
  const labels = {
    'pending':     '🔴 Pending',
    'in-progress': '🟡 In Progress',
    'fixed':       '🟢 Fixed',
  };
  return labels[status] || '🔴 Pending';
}

// ─────────────────────────────────────────────
// 7. TRY TO CENTER MAP ON USER'S LOCATION
// ─────────────────────────────────────────────
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function(position) {
      // Only re-center if no potholes loaded yet
      if (allMarkers.length === 0) {
        map.setView(
          [position.coords.latitude, position.coords.longitude],
          13
        );
      }
    },
    function() {
      // If location denied, stay at default view (Mumbai)
      console.log('Location access denied, using default view');
    }
  );
}

// ─────────────────────────────────────────────
// 8. LOAD POTHOLES WHEN PAGE OPENS
// ─────────────────────────────────────────────
loadPotholes();
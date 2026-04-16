// =============================================
// APP.JS — Controls the pothole report form
// =============================================

// These variables store the captured location
let capturedLat = null;
let capturedLng = null;
let locationMap = null; // Stores the mini map object

// ─────────────────────────────────────────────
// 1. IMAGE PREVIEW
// When user selects a photo, show a preview
// ─────────────────────────────────────────────
document.getElementById('photo').addEventListener('change', function() {

  // 'this.files[0]' is the selected file
  const file = this.files[0];

  if (file) {
    // FileReader reads the file so we can display it
    const reader = new FileReader();

    // When reading is done, show the preview
    reader.onload = function(e) {
      document.getElementById('previewImg').src = e.target.result;
      document.getElementById('imagePreview').style.display = 'block';
    };

    // Start reading the file as a data URL (base64 image)
    reader.readAsDataURL(file);
  }
});

// ─────────────────────────────────────────────
// 2. GET LOCATION
// When user clicks "Get My Location" button
// ─────────────────────────────────────────────
document.getElementById('getLocationBtn').addEventListener('click', function() {

  const statusMsg = document.getElementById('locationStatus');

  // Check if browser supports geolocation
  if (!navigator.geolocation) {
    statusMsg.textContent = '❌ Your browser does not support location.';
    return;
  }

  // Show loading message
  statusMsg.textContent = '📡 Detecting your location...';
  this.disabled = true; // Disable button while loading

  // Ask browser for GPS coordinates
  // This triggers the "Allow location" popup in browser
  navigator.geolocation.getCurrentPosition(

    // ✅ SUCCESS — location found
    function(position) {
      capturedLat = position.coords.latitude;
      capturedLng = position.coords.longitude;

      // Fill in the input fields
      document.getElementById('latitude').value = capturedLat.toFixed(6);
      document.getElementById('longitude').value = capturedLng.toFixed(6);

      // Update status message
      statusMsg.textContent = '✅ Location captured successfully!';
      statusMsg.style.color = 'green';

      // Show the mini map
      showMiniMap(capturedLat, capturedLng);

      // Re-enable button
      document.getElementById('getLocationBtn').disabled = false;
    },

    // ❌ ERROR — location not found
    function(error) {
      let message = '';

      // Different errors have different codes
      switch(error.code) {
        case 1:
          message = '❌ Permission denied. Please allow location access.';
          break;
        case 2:
          message = '❌ Location unavailable. Try again.';
          break;
        case 3:
          message = '❌ Timed out. Try again.';
          break;
      }

      statusMsg.textContent = message;
      statusMsg.style.color = 'red';
      document.getElementById('getLocationBtn').disabled = false;
    }
  );
});

// ─────────────────────────────────────────────
// 3. MINI MAP
// Shows a small map with a pin at user's location
// ─────────────────────────────────────────────
function showMiniMap(lat, lng) {

  // Show the map div (it was hidden before)
  const mapDiv = document.getElementById('locationMap');
  mapDiv.style.display = 'block';

  // If map already exists, remove it first
  if (locationMap) {
    locationMap.remove();
  }

  // Create a new Leaflet map inside the div
  locationMap = L.map('locationMap').setView([lat, lng], 15);

  // Add the map tiles (the actual map image)
  // OpenStreetMap is free — no API key needed!
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(locationMap);

  // Add a red pin at the user's location
  L.marker([lat, lng])
    .addTo(locationMap)
    .bindPopup('📍 Pothole location')
    .openPopup();
}

// ─────────────────────────────────────────────
// 4. FORM SUBMIT
// When user clicks "Submit Report"
// ─────────────────────────────────────────────
document.getElementById('potholeForm').addEventListener('submit', async function(e) {

  // Prevent the page from refreshing (default form behavior)
  e.preventDefault();

  // Check if location was captured
  if (!capturedLat || !capturedLng) {
    alert('⚠️ Please capture your location first!');
    return;
  }

  // Get the description text
  const description = document.getElementById('description').value;

  // Get the photo file
  const photo = document.getElementById('photo').files[0];

  // FormData is a special object that can hold text + files together
  const formData = new FormData();
  formData.append('description', description);
  formData.append('latitude', capturedLat);
  formData.append('longitude', capturedLng);
  formData.append('photo', photo);

  // Disable button and show loading
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = '⏳ Submitting...';

  try {
    // Send data to our backend server
    // We'll build this backend in Step 5
    const response = await fetch('https://pothole-backend-9j2l.onrender.com/api/potholes', {
      method: 'POST',
      body: formData
      // Note: Don't set Content-Type header — browser sets it automatically for FormData
    });

    const result = await response.json();

    if (response.ok) {
      // Show success message
      const msg = document.getElementById('submitMessage');
      msg.textContent = '✅ Report submitted successfully! Thank you!';
      msg.className = 'submit-message success';

      // Reset the form
      document.getElementById('potholeForm').reset();
      document.getElementById('imagePreview').style.display = 'none';
      document.getElementById('locationMap').style.display = 'none';
      capturedLat = null;
      capturedLng = null;
      document.getElementById('locationStatus').textContent = '';

    } else {
      throw new Error(result.message || 'Something went wrong');
    }

  } catch (error) {
    // Show error message
    const msg = document.getElementById('submitMessage');
    msg.textContent = '❌ Error: ' + error.message;
    msg.className = 'submit-message error';
  }

  // Re-enable submit button
  submitBtn.disabled = false;
  submitBtn.textContent = '🚀 Submit Report';
});
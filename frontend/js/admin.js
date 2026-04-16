// =============================================
// ADMIN.JS — Controls the admin dashboard
// =============================================

// Store all reports globally so we can filter
// without re-fetching from server
let allReports = [];

// ─────────────────────────────────────────────
// 1. LOAD ALL REPORTS FROM BACKEND
// ─────────────────────────────────────────────
async function loadReports() {

  // Show loading state
  document.getElementById('reportsGrid').innerHTML =
    '<div class="loading-state">🔄 Loading reports...</div>';

  try {
    // Fetch all potholes from our API
    const response = await fetch('http://localhost:5000/api/potholes');
    const result = await response.json();

    // Save to global variable
    allReports = result.data;

    // Update the stats cards at top
    updateStats(allReports);

    // Display the report cards
    displayReports(allReports);

  } catch (error) {
    document.getElementById('reportsGrid').innerHTML = `
      <div class="empty-state">
        <div style="font-size:3rem">❌</div>
        <p>Could not load reports.<br/>Is your server running?</p>
      </div>
    `;
    console.error('Error:', error);
  }
}

// ─────────────────────────────────────────────
// 2. DISPLAY REPORTS AS CARDS
// ─────────────────────────────────────────────
function displayReports(reports) {

  const grid = document.getElementById('reportsGrid');

  // If no reports, show empty state
  if (reports.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div style="font-size:3rem">📭</div>
        <p>No reports found.</p>
      </div>
    `;
    return;
  }

  // Build HTML for each report card
  grid.innerHTML = reports.map(report => {

    // Format date nicely
    const date = new Date(report.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Return the card HTML
    return `
      <div class="report-card" id="card-${report._id}">

        <!-- Pothole photo -->
        <img
          class="card-image"
          src="${report.imageUrl}"
          alt="Pothole"
          onerror="this.src='https://via.placeholder.com/320x180?text=No+Image'"
        />

        <div class="card-body">

          <!-- Description -->
          <h3>🚧 ${report.description}</h3>

          <!-- Location coordinates -->
          <p class="card-meta">
            📍 ${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}
          </p>

          <!-- Date reported -->
          <p class="card-meta">📅 ${date}</p>

          <!-- Current status badge -->
          <span class="status-badge badge-${report.status}">
            ${getStatusLabel(report.status)}
          </span>

          <!-- ACTION BUTTONS -->
          <div class="card-actions">

            <!-- Status dropdown -->
            <select
              class="status-select"
              id="select-${report._id}"
            >
              <option value="pending"
                ${report.status === 'pending' ? 'selected' : ''}>
                🔴 Pending
              </option>
              <option value="in-progress"
                ${report.status === 'in-progress' ? 'selected' : ''}>
                🟡 In Progress
              </option>
              <option value="fixed"
                ${report.status === 'fixed' ? 'selected' : ''}>
                🟢 Fixed
              </option>
            </select>

            <!-- Update button -->
            <button
              class="btn-update"
              onclick="updateStatus('${report._id}')"
            >
              ✅ Update
            </button>

            <!-- Delete button -->
            <button
              class="btn-delete"
              onclick="deleteReport('${report._id}')"
            >
              🗑️
            </button>

          </div>
        </div>
      </div>
    `;
  }).join(''); // Join all cards into one string
}

// ─────────────────────────────────────────────
// 3. UPDATE POTHOLE STATUS
// Called when admin clicks "Update" button
// ─────────────────────────────────────────────
async function updateStatus(id) {

  // Get the selected status from dropdown
  const newStatus = document.getElementById(`select-${id}`).value;

  try {
    // Send PATCH request to backend
    const response = await fetch(`http://localhost:5000/api/potholes/${id}`, {
      method: 'PATCH',
      headers: {
        // Tell server we're sending JSON
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });

    const result = await response.json();

    if (response.ok) {
      // Show success toast notification
      showToast(`✅ Status updated to "${newStatus}"!`);

      // Reload reports to show updated data
      loadReports();
    } else {
      showToast('❌ Failed to update status');
    }

  } catch (error) {
    showToast('❌ Server error. Try again.');
    console.error('Error:', error);
  }
}

// ─────────────────────────────────────────────
// 4. DELETE A REPORT
// Called when admin clicks delete button
// ─────────────────────────────────────────────
async function deleteReport(id) {

  // Ask for confirmation before deleting
  const confirmed = confirm(
    '⚠️ Are you sure you want to delete this report?\nThis cannot be undone!'
  );

  if (!confirmed) return;

  try {
    // Send DELETE request to backend
    const response = await fetch(`http://localhost:5000/api/potholes/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      showToast('🗑️ Report deleted successfully!');

      // Remove card from page without reloading
      const card = document.getElementById(`card-${id}`);
      if (card) {
        // Smooth fade out animation
        card.style.transition = 'opacity 0.3s, transform 0.3s';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.9)';
        setTimeout(() => {
          card.remove();
          // Update stats after removal
          allReports = allReports.filter(r => r._id !== id);
          updateStats(allReports);
        }, 300);
      }
    } else {
      showToast('❌ Failed to delete report');
    }

  } catch (error) {
    showToast('❌ Server error. Try again.');
    console.error('Error:', error);
  }
}

// ─────────────────────────────────────────────
// 5. FILTER REPORTS
// Filter by status or search text
// ─────────────────────────────────────────────
function filterReports() {

  const statusFilter = document.getElementById('statusFilter').value;
  const searchText   = document.getElementById('searchInput').value.toLowerCase();

  // Filter from the global allReports array
  let filtered = allReports;

  // Apply status filter
  if (statusFilter !== 'all') {
    filtered = filtered.filter(r => r.status === statusFilter);
  }

  // Apply search filter
  if (searchText) {
    filtered = filtered.filter(r =>
      r.description.toLowerCase().includes(searchText)
    );
  }

  // Display filtered results
  displayReports(filtered);
}

// ─────────────────────────────────────────────
// 6. UPDATE STATS CARDS
// ─────────────────────────────────────────────
function updateStats(reports) {
  const total    = reports.length;
  const pending  = reports.filter(r => r.status === 'pending').length;
  const progress = reports.filter(r => r.status === 'in-progress').length;
  const fixed    = reports.filter(r => r.status === 'fixed').length;

  document.getElementById('statTotal').textContent    = total;
  document.getElementById('statPending').textContent  = pending;
  document.getElementById('statProgress').textContent = progress;
  document.getElementById('statFixed').textContent    = fixed;
}

// ─────────────────────────────────────────────
// 7. TOAST NOTIFICATION
// Small popup message at bottom right
// ─────────────────────────────────────────────
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');

  // Hide after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ─────────────────────────────────────────────
// 8. HELPER — Readable status label
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
// 9. LOAD REPORTS WHEN PAGE OPENS
// ─────────────────────────────────────────────
loadReports();
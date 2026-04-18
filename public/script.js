const API = window.location.origin;
let student_id = "";

/* UTILS: TOAST */
function showToast(message, type = 'info') {
  const toast = document.getElementById("toast");
  const msgSpan = document.getElementById("toastMessage");
  const iconDiv = document.getElementById("toastIcon");
  
  msgSpan.innerText = message;
  
  // Set icon based on type
  if (type === 'success') {
    iconDiv.innerHTML = '<svg class="icon" style="color:var(--success)" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
    toast.style.borderLeftColor = 'var(--success)';
  } else if (type === 'error') {
    iconDiv.innerHTML = '<svg class="icon" style="color:var(--error)" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    toast.style.borderLeftColor = 'var(--error)';
  } else {
    iconDiv.innerHTML = '<svg class="icon" style="color:var(--primary)" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    toast.style.borderLeftColor = 'var(--primary)';
  }

  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 4000);
}

/* LOGIN */
async function login() {
  const name = document.getElementById("name").value.trim();
  student_id = document.getElementById("student_id").value.trim();
  const section = document.getElementById("section").value.trim();
  const batch = document.getElementById("batch").value.trim();

  if (!name || !student_id || !section || !batch) {
    showToast("Please fill all fields", "error");
    return;
  }

  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, student_id, section, batch })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      showToast(data.error || "Login failed", "error");
      return;
    }

    showToast(data.message, "success");
    
    // Switch UI with animation
    const loginSec = document.getElementById("loginSection");
    const voteSec = document.getElementById("votingSection");
    
    // Set global student_id for subsequent requests
    student_id = document.getElementById("student_id").value.trim();
    
    loginSec.style.opacity = "0";
    setTimeout(() => {
      loginSec.style.display = "none";
      voteSec.style.display = "block";
    }, 400);

  } catch (err) {
    showToast("Server connection failed", "error");
  }
}

/* VOTE */
async function vote(candidate) {
  if (!student_id) {
    showToast("Session expired. Please login again.", "error");
    return;
  }

  try {
    const res = await fetch(`${API}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidate, student_id })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      showToast(data.error || "Vote failed", "error");
      return;
    }

    showToast(data.message, "success");
    
    // Select the button visually
    document.querySelectorAll('.vote-btn').forEach(btn => {
      btn.classList.remove('selected');
      if (btn.innerText.includes(candidate)) btn.classList.add('selected');
    });

  } catch (err) {
    showToast("Server error recording vote", "error");
  }
}

/* REMOVE VOTE */
document.getElementById("removeVoteBtn").onclick = async () => {
  if (!student_id) return;

  if (!confirm("Are you sure you want to withdraw your vote?")) return;

  try {
    const res = await fetch(`${API}/removeVote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_id })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      showToast(data.error || "Failed to remove vote", "error");
      return;
    }

    showToast(data.message, "success");
    document.querySelectorAll('.vote-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById("results").classList.remove("show");

  } catch (err) {
    showToast("Server error removing vote", "error");
  }
};

/* ADMIN RESULTS */
document.getElementById("endVote").onclick = async () => {
  const password = prompt("Enter Admin Password:");
  if (!password) return;

  try {
    const res = await fetch(`${API}/results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || "Authentication failed", "error");
      return;
    }

    const { summary, details, totalStudents, timeline } = data;

    const resultsDiv = document.getElementById("results");
    const resultsList = document.getElementById("resultsList");
    resultsList.innerHTML = "";
    
    const totalVotes = summary.reduce((acc, curr) => acc + curr.votes, 0);

    summary.forEach(row => {
      const percentage = totalVotes > 0 ? (row.votes / totalVotes * 100).toFixed(1) : 0;
      resultsList.innerHTML += `
        <div class="result-item">
          <div class="result-header">
            <span>${row.candidate}</span>
            <span>${row.votes} votes (${percentage}%)</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
    });

    // Update Analytics Dashboard
    updateAnalytics(summary, totalStudents, timeline);

    // Render Voter Details
    const voterDetailsDiv = document.getElementById("voterDetails");
    const voterTableBody = document.getElementById("voterTableBody");
    voterTableBody.innerHTML = "";

    if (details && details.length > 0) {
      details.forEach(voter => {
        voterTableBody.innerHTML += `
          <tr>
            <td style="font-weight: 600;">${voter.name}</td>
            <td style="color: var(--text-muted); font-family: monospace;">${voter.student_id}</td>
            <td><span class="badge badge-${voter.candidate}">${voter.candidate}</span></td>
          </tr>
        `;
      });
      voterDetailsDiv.style.display = "block";
    }

    resultsDiv.style.display = "block";
    setTimeout(() => resultsDiv.classList.add("show"), 10);
    showToast("Advanced Analytics loaded", "success");

  } catch (err) {
    console.error(err);
    showToast("Error fetching results", "error");
  }
};

let shareChart, timelineChart;
function updateAnalytics(summary, totalStudents, timeline) {
  const totalVotes = summary.reduce((acc, curr) => acc + curr.votes, 0);
  const participation = totalStudents > 0 ? ((totalVotes / totalStudents) * 100).toFixed(1) : 0;
  
  document.getElementById("statTotalStudents").innerText = totalStudents;
  document.getElementById("statParticipation").innerText = participation + "%";
  
  const leader = summary.length > 0 ? summary.reduce((prev, curr) => (prev.votes > curr.votes) ? prev : curr) : null;
  document.getElementById("statLeader").innerText = leader ? leader.candidate : "N/A";

  const shareOptions = {
    series: summary.map(s => s.votes),
    labels: summary.map(s => s.candidate),
    chart: { type: 'donut', height: 280, foreColor: '#94a3b8' },
    colors: ['#6366f1', '#ec4899', '#10b981'],
    stroke: { show: false },
    dataLabels: { enabled: false },
    legend: { position: 'bottom' },
    plotOptions: { pie: { donut: { size: '75%', background: 'transparent' } } },
    title: { text: "Candidate Share", align: 'center', style: { color: '#f8fafc' } }
  };

  if (shareChart) shareChart.destroy();
  shareChart = new ApexCharts(document.querySelector("#shareChart"), shareOptions);
  shareChart.render();

  const timelineOptions = {
    series: [{ name: 'Votes', data: timeline.map(t => t.count) }],
    chart: { type: 'area', height: 280, toolbar: { show: false }, foreColor: '#94a3b8' },
    colors: ['#6366f1'],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.1 } },
    dataLabels: { enabled: false },
    xaxis: { categories: timeline.map(t => t.time) },
    grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
    title: { text: "Voting Velocity", align: 'center', style: { color: '#f8fafc' } }
  };

  if (timelineChart) timelineChart.destroy();
  timelineChart = new ApexCharts(document.querySelector("#timelineChart"), timelineOptions);
  timelineChart.render();

  document.getElementById("analyticsDashboard").style.display = "block";
}

/* CLOSE RESULTS */
document.getElementById("closeResults").onclick = () => {
  const resultsDiv = document.getElementById("results");
  resultsDiv.classList.remove("show");
  setTimeout(() => resultsDiv.style.display = "none", 400);
};
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

    const resultsDiv = document.getElementById("results");
    const resultsList = document.getElementById("resultsList");
    resultsList.innerHTML = "";
    
    const totalVotes = data.reduce((acc, curr) => acc + curr.votes, 0);

    data.forEach(row => {
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

    resultsDiv.style.display = "block";
    setTimeout(() => resultsDiv.classList.add("show"), 10);
    showToast("Results loaded successfully", "success");

  } catch (err) {
    showToast("Error fetching results", "error");
  }
};
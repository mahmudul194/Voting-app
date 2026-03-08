const API = window.location.origin;
let student_id = "";

/* LOGIN */
function login() {
  const name = document.getElementById("name").value;
  student_id = document.getElementById("student_id").value;
  const section = document.getElementById("section").value;
  const batch = document.getElementById("batch").value;

  if (!name || !student_id || !section || !batch) {
    alert("❌ All fields are required");
    return;
  }

  fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, student_id, section, batch })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) { alert("❌ " + data.error); return; }
      alert("✅ " + data.message);
      document.getElementById("loginSection").style.display = "none";
      document.getElementById("votingSection").style.display = "block";
    })
    .catch(() => alert("❌ Server error"));
}

/* VOTE */
function vote(candidate) {
  if (!student_id) { alert("❌ You must login first"); return; }

  fetch(`${API}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidate, student_id })
  })
    .then(res => res.json())
    .then(data => alert(data.message || data.error))
    .catch(() => alert("❌ Server error"));
}

/* REMOVE VOTE */
document.getElementById("removeVoteBtn").onclick = () => {
  if (!student_id) { alert("❌ You must login first"); return; }

  fetch(`${API}/removeVote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ student_id })
  })
    .then(res => res.json())
    .then(data => alert(data.message || data.error))
    .catch(() => alert("❌ Server error"));
};

/* ADMIN RESULTS */
document.getElementById("endVote").onclick = async () => {
  const password = prompt("Enter admin password to view results:");
  if (!password) return;

  const res = await fetch(`${API}/results`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  });

  const data = await res.json();
  if (!res.ok) { alert(data.error || "Unauthorized"); return; }

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";
  data.forEach(row => resultsDiv.innerHTML += `<p><strong>${row.candidate}</strong>: ${row.votes} votes</p>`);
  resultsDiv.classList.add("show");
};
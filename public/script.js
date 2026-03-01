const API = window.location.origin;

/* ===========================
   LOGIN
=========================== */
function login() {
  const name = document.getElementById("name").value;
  const student_id = document.getElementById("student_id").value;
  const section = document.getElementById("section").value;
  const batch = document.getElementById("batch").value;

  fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, student_id, section, batch })
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      alert("❌ " + data.error);
      return;
    }

    alert("✅ Login Successful");

    document.getElementById("loginSection").style.display = "none";
    document.getElementById("votingSection").style.display = "block";
  })
  .catch(() => alert("❌ Server error"));
}

/* ===========================
   VOTE (Protected)
=========================== */
function vote(candidate) {
  fetch(`${API}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidate })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message || data.error);
  })
  .catch(() => alert("❌ Server error"));
}

/* ===========================
   REMOVE VOTE
=========================== */
document.getElementById("removeVoteBtn").onclick = () => {
  fetch(`${API}/removeVote`, {
    method: "POST"
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message || data.error);
  });
};

/* ===========================
   SHOW RESULTS
=========================== */
document.getElementById("endVote").onclick = () => {
  fetch(`${API}/results`)
  .then(res => res.json())
  .then(data => {
    const resultsDiv = document.getElementById("results");

    if (data.error) {
      alert(data.error);
      return;
    }

    let html = "<h3>Voting Results:</h3>";

    const topVotes = Math.max(...data.map(d => d.vote_count));
    const winners = data.filter(d => d.vote_count === topVotes);

    data.forEach(row => {
      html += `<p>${row.candidate}: ${row.vote_count} votes</p>`;
    });

    if (winners.length === 1) {
      html += `<p>🏆 Winner: <strong>${winners[0].candidate}</strong></p>`;
    } else {
      html += `<p>🤝 It's a tie!</p>`;
    }

    resultsDiv.innerHTML = html;
    resultsDiv.classList.add("show");
  });
};
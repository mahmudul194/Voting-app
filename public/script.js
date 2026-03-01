const API_URL = window.location.origin;

let hasVoted = localStorage.getItem("hasVoted") === "true";
let votedCandidate = localStorage.getItem("votedCandidate");

/* ========================
   Vote
======================== */
function vote(candidate) {
  if (hasVoted) {
    alert("❌ You have already voted.");
    return;
  }

  fetch(`${API_URL}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidate })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert("❌ " + data.error);
        return;
      }

      alert("✅ " + data.message);

      hasVoted = true;
      votedCandidate = candidate;
      localStorage.setItem("hasVoted", "true");
      localStorage.setItem("votedCandidate", candidate);
    })
    .catch(() => alert("❌ Server error."));
}

/* ========================
   Remove Vote
======================== */
function removeVote() {
  if (!hasVoted) {
    alert("❌ You have not voted yet.");
    return;
  }

  fetch(`${API_URL}/removeVote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidate: votedCandidate })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert("❌ " + data.error);
        return;
      }

      alert("✅ " + data.message);

      hasVoted = false;
      votedCandidate = null;
      localStorage.setItem("hasVoted", "false");
      localStorage.removeItem("votedCandidate");
    })
    .catch(() => alert("❌ Server error."));
}

/* ========================
   Show Results
======================== */
document.getElementById("endVote").onclick = () => {
  const password = prompt("Enter admin password:");

  if (password !== "0188") {
    alert("❌ Incorrect password.");
    return;
  }

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "<h3>Loading results...</h3>";

  fetch(`${API_URL}/results`)
    .then(res => res.json())
    .then(data => {
      if (!data.length) {
        resultsDiv.innerHTML = "<h3>No candidates found</h3>";
        return;
      }

      let resultHTML = "<h3>Voting Results:</h3>";

      const topVotes = Math.max(...data.map(d => d.vote_count));
      const winners = data.filter(d => d.vote_count === topVotes);

      data.forEach(row => {
        resultHTML += `<p>${row.candidate}: ${row.vote_count} votes</p>`;
      });

      if (winners.length === 1) {
        resultHTML += `<p>🏆 Winner: <strong>${winners[0].candidate}</strong></p>`;
      } else {
        resultHTML += `<p>🤝 It's a tie!</p>`;
      }

      resultsDiv.innerHTML = resultHTML;
    })
    .catch(() => {
      resultsDiv.innerHTML = "<h3>Error loading results</h3>";
    });
};

document.getElementById("removeVoteBtn").onclick = removeVote;
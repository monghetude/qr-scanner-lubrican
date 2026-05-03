// Session Validators
const token = localStorage.getItem("sessionToken");

if (!token) {
  window.location.href = "/qr-scanner-lubrican/index.html";
}

function checkSession() {
  const token = localStorage.getItem("sessionToken");

  if (!token) {
    window.location.href = "/qr-scanner-lubrican/index.html";
  }

  fetch("https://script.google.com/macros/s/AKfycbwYhaIIxax9_IjEqW6KlK8p7l2eMiB7zDhEJwI350SeEl-3oxt4T1WNnHn0VyUgmlFz/exec", {
    method: "POST",
    body: JSON.stringify({
      action: "validateSession",
      sessionToken: token
    })
  })
  .then(r => r.json())
  .then(res => {
    if (!res.valid) {
      localStorage.clear();
      window.location.href = "/qr-scanner-lubrican/index.html";
    }
  });
}

setInterval(checkSession, 300000); // every 5 min

function validateSessionOnLoad() {
  const token = localStorage.getItem("sessionToken");

  if (!token) {
    window.location.href = "/qr-scanner-lubrican/index.html";
    return;
  }

  fetch("https://script.google.com/macros/s/AKfycbwYhaIIxax9_IjEqW6KlK8p7l2eMiB7zDhEJwI350SeEl-3oxt4T1WNnHn0VyUgmlFz/exec", {
    method: "POST",
    body: JSON.stringify({
      action: "validateSession",
      sessionToken: token
    })
  })
  .then(res => res.json())
  .then(res => {
    if (!res.valid) {
      localStorage.clear();
      window.location.href = "/qr-scanner-lubrican/index.html";
    }
  })
  .catch(() => {
    // fail-safe: if backend is unreachable, lock user out
    localStorage.clear();
    window.location.href = "/qr-scanner-lubrican/index.html";
  });
}

validateSessionOnLoad();


// Main call
fetch("https://script.google.com/macros/s/AKfycbwYhaIIxax9_IjEqW6KlK8p7l2eMiB7zDhEJwI350SeEl-3oxt4T1WNnHn0VyUgmlFz/exec", {
  method: "POST",
  body: JSON.stringify({
    action: "getSeeds",
    sessionToken: localStorage.getItem("sessionToken")
  })
})
.then(res => res.json())
.then(data => {
  const tbody = document.getElementById("seedTableBody");

  if (!data.seeds) {
    showToast("No seeds found or session invalid");
    return;
  }
  
  data.seeds.forEach(seed => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${seed.seedId}</td>
      <td>${seed.name}</td>
      <td>${seed.cbo}</td>
    `;

    tbody.appendChild(row);
  });
})
.catch(err => {
  console.error(err);
  showToast("Session Expired");
});

// toast function
function showToast(message, duration = 3000) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

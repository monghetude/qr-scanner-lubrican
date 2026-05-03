if (localStorage.getItem("role") !== "admin") {
  window.location.href = "/qr-scanner-lubrican/scanner.html";
}

const token = localStorage.getItem("sessionToken");

if (!token) {
  window.location.href = "index.html";
}

function createUser() {
  fetch("https://script.google.com/macros/s/AKfycbwYhaIIxax9_IjEqW6KlK8p7l2eMiB7zDhEJwI350SeEl-3oxt4T1WNnHn0VyUgmlFz/exec", {
    method: "POST",
    body: JSON.stringify({
      action: "createUser",
      sessionToken: localStorage.getItem("sessionToken"),
      username: document.getElementById("newUsername").value,
      password: document.getElementById("newPassword").value,
      role: document.getElementById("newRole").value,
      cbo: document.getElementById("newCbo").value
    })
  })
  .then(r => r.json())
  .then(res => {
    if (res.success) {
      alert("User created");
    } else {
      alert(res.message);
    }
  });
}

function checkSession() {
  const token = localStorage.getItem("sessionToken");

  if (!token) {
    window.location.href = "index.html";
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
      window.location.href = "index.html";
    }
  });
}

setInterval(checkSession, 300000); // every 5 min

function validateSessionOnLoad() {
  const token = localStorage.getItem("sessionToken");

  if (!token) {
    window.location.href = "index.html";
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
      window.location.href = "index.html";
    }
  })
  .catch(() => {
    // fail-safe: if backend is unreachable, lock user out
    localStorage.clear();
    window.location.href = "index.html";
  });
}

validateSessionOnLoad();

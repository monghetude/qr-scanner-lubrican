if (localStorage.getItem("role") !== "admin") {
  window.location.href = "scanner.html";
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

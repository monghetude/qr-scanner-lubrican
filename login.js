console.log("login.js loaded");

document.getElementById("loginBtn").addEventListener("click", loginUser);

function loginUser() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // TEMPORARY hardcoded validation
  // Later this should come from GAS backend

fetch("https://script.google.com/macros/s/AKfycbwYhaIIxax9_IjEqW6KlK8p7l2eMiB7zDhEJwI350SeEl-3oxt4T1WNnHn0VyUgmlFz/exec", {
  method: "POST",
  body: JSON.stringify({
    action: "login",
    username,
    password
  })
})
.then(r => r.json())
.then(res => {
  if (res.success) {

    localStorage.setItem("sessionToken", res.sessionToken);
    localStorage.setItem("username", res.username);
    localStorage.setItem("cbo", res.cbo);
    localStorage.setItem("role", res.role);

    window.location.href = "scanner.html";
  } else {
    showToast(res.message);
  }
});
}

console.log("login.js loaded");

document.getElementById("loginBtn").addEventListener("click", loginUser);

function loginUser() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // TEMPORARY hardcoded validation
  // Later this should come from GAS backend

  if (username === "admin" && password === "1234") {
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("username", username);
    localStorage.setItem("cbo", "LoveYourself");
    localStorage.setItem("role", "admin");

    window.location.href = "scanner.html";
  } else {
    document.getElementById("loginMessage").innerText = "Invalid login";
  }
}

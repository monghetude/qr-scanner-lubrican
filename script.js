let qrReader;

const startBtn = document.getElementById("startScanBtn");
const stopBtn = document.getElementById("stopScanBtn");

startBtn.addEventListener("click", startScanner);
stopBtn.addEventListener("click", stopScanner);

function startScanner() {
  qrReader = new Html5Qrcode("qr-reader");

  qrReader.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },

    (decodedText) => {
      stopScanner();

      document.getElementById("result").innerHTML = "<p>Searching...</p>";

      searchQR(decodedText);
    }
  )
  .then(() => {
    stopBtn.style.display = "inline-block";
  })
  .catch(err => {
    showToast("Camera Error: " + err);
    console.error(err);
  });
}

function stopScanner() {
  if (qrReader) {
    qrReader.stop()
      .then(() => qrReader.clear())
      .catch(err => console.error(err));
  }

  stopBtn.style.display = "none";
}

function searchQR(qrValue) {
  fetch("https://script.google.com/macros/s/AKfycbwYhaIIxax9_IjEqW6KlK8p7l2eMiB7zDhEJwI350SeEl-3oxt4T1WNnHn0VyUgmlFz/exec", {
    method: "POST",
    body: JSON.stringify({
      action: "searchQR",
      qrValue: qrValue
    })
  })
  .then(res => res.json())
  .then(res => {

    if (!res.found) {
      document.getElementById("result").innerHTML =
        "<p>No match found</p>";
      return;
    }

    document.getElementById("result").innerHTML = `
      <div style="border:2px solid #350002; border-radius:10px; overflow:hidden;">
        <table style="width:100%; border-collapse:collapse;">
          <tr>
            <td style="background:#350002; padding:5px;">Seed ID</td>
            <td style="background:#773536; padding:5px;">${res.seedId}</td>
          </tr>
          <tr>
            <td style="background:#350002; padding:5px;">Name</td>
            <td style="background:#773536; padding:5px;">${res.name}</td>
          </tr>
          <tr>
            <td style="background:#350002; padding:5px;">CBO</td>
            <td style="background:#773536; padding:5px;">${res.cbo}</td>
          </tr>
        </table>
      </div>
    `;
  })
  .catch(err => {
    console.error(err);
    showToast("Search failed");
  });
}


function showToast(message, duration = 3000) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

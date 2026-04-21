let qrReader;

// Variable Assignments
const startBtn = document.getElementById("startScanBtn");
const stopBtn = document.getElementById("stopScanBtn");
const modeSwitch = document.getElementById("modeSwitch");
const modeLabel = document.getElementById("modeLabel");
const uploadBtn = document.getElementById("uploadQRBtn");
const fileInput = document.getElementById("qr-upload");
const scanSection = document.getElementById("scanSection");
const manualSection = document.getElementById("manualSection");
const clientDetails = document.getElementById("clientDetails");

modeSwitch.addEventListener("change", updateMode);
updateMode(); // set default view on load

// Event Listeners
startBtn.addEventListener("click", startScanner);
stopBtn.addEventListener("click", stopScanner);
uploadBtn.addEventListener("click", () => {
  fileInput.click();
});
fileInput.addEventListener("change", uploadScan);

// TEMPLATE FUNCTIONS -------------------

// QR Cam Scanner Inititate
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

// Uploaded QR Scan
function uploadScan(e) {
  const file = e.target.files[0];
  if(!file) return;
  const fileScanner = new Html5Qrcode("qr-reader");

  fileScanner.scanFile(file, /* showImage= */ false)
    .then((decodedText) => {
      document.getElementById("result").innerHTML = "<p>Searching...</p>";
      searchQR(decodedText);
    })
      .catch(err => {
      console.error(err);
      showToast("No QR code found in image");
    })
    .finally(() => {
      e.target.value = "";
    });
};


// Stop Scanner
function stopScanner() {
  if (qrReader) {
    qrReader.stop()
      .then(() => qrReader.clear())
      .catch(err => console.error(err));
  }

  stopBtn.style.display = "none";
}

// Search QR Value
function searchQR(qrValue) {
  fetch(
    "https://script.google.com/macros/s/AKfycbwYhaIIxax9_IjEqW6KlK8p7l2eMiB7zDhEJwI350SeEl-3oxt4T1WNnHn0VyUgmlFz/exec?qrValue=" 
    + encodeURIComponent(qrValue)
  )
  .then(res => res.json())
  .then(res => {
    if (!res.found) {
      document.getElementById("result").innerHTML = "<p>No match found</p>";
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
      <div id="clientDetails" style="display:block; max-width: 100%; border-radius: 8px; border: solid 2px #4b0102">
      <label style="text-align: left; margin-top: 8px;">Client UIC</label>
      <input type="text" class="clientFields" id="uicInput"/>
      <label style="text-align: left; margin-top: 8px;">Date of Visit</label>
      <input type="date" class="clientFields" id="dateVisitInput"/>
      <label style="text-align: left; margin-top: 8px;">KAP Group</label>
      <select id="kapGroupSelect" class="clientFields">
        <option value="" selected disabled hidden>Select KAP Group</option>
        <option value="MSM">MSM (Men having Sex with other Men)</option>
        <option value="TGW">TGW (Transgender Women)</option>
      </select>
      <label style="text-align: left; margin-top: 8px;">Logged By:</label>
      <input type="text" id="loggedByInput" class="clientFields"/>
      </div>
    `;    
    // create save button
    const saveBtn = document.createElement('button');
    saveBtn.innerText = 'Save';
    saveBtn.id = 'saveBtn';
    document.getElementById('result').appendChild(saveBtn);

    // create cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.innerText = 'Cancel';
    cancelBtn.id = 'saveBtn';
    document.getElementById('result').appendChild(cancelBtn);
    
    // save button on click
    saveBtn.onclick = () => {
        // Store input values into variables
        const uicValue = document.getElementById('uicInput').value;
        const visitValue = document.getElementById('dateVisitInput').value;
        const kapValue = document.getElementById('kapGroupSelect').value;
        const loggerValue = document.getElementById('loggedByInput').value;

        // Highlight blank fields
        const fields = [
          document.getElementById('uicInput'),
          document.getElementById('dateVisitInput'),
          document.getElementById('kapGroupSelect'),
          document.getElementById('loggedByInput')
        ];
        let hasBlank = false;
        fields.forEach(f => {
          if (!f.value || f.value === "") {
            f.style.border = "2px solid red";
            hasBlank = true;
          } else {
            f.style.border = "";
          }
        });
        if (hasBlank) {
          showToast("Please complete all required fields.");
          return;
        }
        
        // Save initiation
        saveScan({
        seedId : res.seedId,
        name : res.name,
        cbo : res.cbo,
        uicValue: uicValue,
        visitValue: visitValue,
        kapValue: kapValue,
        loggerValue: loggerValue
      });
    };

    // cancel button function
    document.getElementById('cancelBtn').addEventListener('click', () => {
      document.getElementById('result').innerHTML = "";
    }) 
    
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

//save scan function
function saveScan(payload) {
  fetch("https://script.google.com/macros/s/AKfycbwYhaIIxax9_IjEqW6KlK8p7l2eMiB7zDhEJwI350SeEl-3oxt4T1WNnHn0VyUgmlFz/exec", {
  method: "POST",
  body: JSON.stringify({
    action: "saveScan",
    payload: {
      seedId: payload.seedId,
      name: payload.name,
      cbo: payload.cbo,
      uicValue: payload.uicValue,
      visitValue: payload.visitValue,
      kapValue: payload.kapValue,
      loggerValue: payload.loggerValue
    }
  })
})
.then(r => r.json())
.then(data => {
  console.log("Saved:", data);
});
}

function updateMode() {
  if (modeSwitch.checked) {
    modeLabel.textContent = "Scan Mode";
    scanSection.style.display = "block";
    manualSection.style.display = "none";
  } else {
    modeLabel.textContent = "Manual Mode";
    scanSection.style.display = "none";
    manualSection.style.display = "block";
  }
}

const token = localStorage.getItem("sessionToken");

if (!token) {
  window.location.href = "/qr-scanner-lubrican/index.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const userInfo = document.getElementById("userGreeting");

  if (userGreeting) {
document.getElementById("userGreeting").innerText =
  `Hello, ${localStorage.getItem("cbo") || "User"}!`;
  }

// logout button
document.getElementById("logoutBtn").addEventListener("click", logout);

function logout() {
  localStorage.clear();
  window.location.href = "/qr-scanner-lubrican/index.html";
}
});



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
const gIdManual = document.getElementById("gIdManual");
const searchManual = document.getElementById("searchManual");
const hamburger = document.getElementById("hamburger");
const sideMenu = document.getElementById("sideMenu");
const overlay = document.getElementById("overlay");

// EVENT LISTENERS -------------------

// open menu
hamburgerBtn.addEventListener("click", () => {
  sideMenu.classList.add("open");
  overlay.classList.add("show");
});

// close menu (click outside)
overlay.addEventListener("click", closeMenu);

// optional: clicking menu links closes it too
document.querySelectorAll(".side-menu a").forEach(link => {
  link.addEventListener("click", closeMenu);
});

function closeMenu() {
  sideMenu.classList.remove("open");
  overlay.classList.remove("show");
}

modeSwitch.addEventListener("change", updateMode);
updateMode(); // set default view on load

startBtn.addEventListener("click", startScanner);
stopBtn.addEventListener("click", stopScanner);
uploadBtn.addEventListener("click", () => {
  fileInput.click();
});
fileInput.addEventListener("change", uploadScan);
searchManual.addEventListener("click", searchById);

  // Text auto-format for seed ID
  gIdManual.addEventListener('input', function () {
    // Get current value and remove everything except letters/numbers
    let value = this.value.replace(/[^a-zA-Z0-9]/g, '');

    // First 3 characters = letters only
    let letters = value.substring(0, 3).replace(/[^a-zA-Z]/g, '').toUpperCase();

    // Remaining characters = numbers only
    let numbers = value.substring(3).replace(/[^0-9]/g, '').substring(0, 4);

    // Build final format
    let formatted = letters;

    if (letters.length === 3 && numbers.length > 0) {
      formatted += '-';
    }

    formatted += numbers;

    // Limit total length to 8 (ABC-0000)
    this.value = formatted.substring(0, 8);
  });

  // Enter keypress
  gIdManual.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault(); // prevents form submit/reload if inside a form
      searchById();
    }
  });



// TEMPLATE FUNCTIONS -------------------

// QR Cam Scanner Inititate
function startScanner() {
  document.getElementById("startScanBtn").disabled = true;
  document.getElementById("startScanBtn").style.opacity = "50%";
  
  qrReader = new Html5Qrcode("qr-reader");

  qrReader.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },

    (decodedText) => {
      

      document.getElementById("result").innerHTML = "<p>Searching...</p>";
      stopScanner();
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
  document.getElementById("startScanBtn").disabled = false;
  document.getElementById("startScanBtn").style.opacity = "100%";
  }

  stopBtn.style.display = "none";
}

// Search QR Value
function searchQR(qrValue) {
  document.getElementById("startScanBtn").disabled = true;
  document.getElementById("startScanBtn").style.opacity = "50%";
  document.getElementById("uploadQRBtn").disabled = true;
  document.getElementById("uploadQRBtn").style.opacity = "50%";

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
      <div class="resultsDiv">
        <table class="resultsTable">
          <tr>
            <td colspan="2" style="font-weight: bold; background: #0c1134; padding: 4px;">Seed Details</td>
          </tr>
          <tr>
            <td>Seed ID</td>
            <td>${res.seedId}</td>
          </tr>
          <tr>
            <td>Name</td>
            <td>${res.name}</td>
          </tr>
          <tr>
            <td>CBO</td>
            <td>${res.cbo}</td>
          </tr>
        </table>
      </div>
      <h4 style="color: white; margin-bottom: 3px; border-radius: 8px; background: #0c1134; padding 3px;">Client Details</h4>
      <div id="clientDetails">
      <label class="clientFieldLabel">Client UIC</label>
      <input type="text" placeholder="example: MAJO0112011999" class="clientFields" id="uicInput"/>
      <label class="clientFieldLabel">Date of Visit</label>
      <input type="date" class="clientFields" id="dateVisitInput"/>
      <label class="clientFieldLabel">KAP Group</label>
      <select id="kapGroupSelect" class="clientFields">
        <option value="" selected disabled hidden>Select KAP Group</option>
        <option value="MSM">MSM (Men having Sex with other Men)</option>
        <option value="TGW">TGW (Transgender Women)</option>
      </select>
      <label class="clientFieldLabel">Logged By:</label>
      <input type="text" id="loggedByInput" class="clientFields"/>
      </div>
    `;
    // UIC formatting
    const uicInputSearch = document.getElementById('uicInput');
    uicInputSearch.addEventListener("input", function () {
      let uicForm = this.value.replace(/[^a-zA-Z0-9]/g, '');
      let uicLetters = uicForm.substring(0, 4).replace(/[^a-zA-Z]/g, '').toUpperCase();
      let uicNumbers = uicForm.substring(4).replace(/[^0-9]/g, '').substring(0, 10);
      let formatted = uicLetters + uicNumbers;
      this.value = formatted.substring(0, 14)
    })

    
    // create save button
    const saveBtn = document.createElement('button');
    saveBtn.innerText = 'Save';
    saveBtn.id = 'saveBtn';
    document.getElementById('result').appendChild(saveBtn);

    // create cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.innerText = 'Cancel';
    cancelBtn.id = 'cancelBtn';
    document.getElementById('result').appendChild(cancelBtn);
    
    // save button on click
    saveBtn.onclick = () => {
        document.getElementById("saveBtn").disabled = true;
        document.getElementById("saveBtn").style.opacity = "50%";
        document.getElementById("cancelBtn").disabled = true;
        document.getElementById("cancelBtn").style.opacity = "50%";

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
          document.getElementById("saveBtn").disabled = false;
          document.getElementById("saveBtn").style.opacity = "100%";
          document.getElementById("cancelBtn").disabled = false;
          document.getElementById("cancelBtn").style.opacity = "100%";
          return;
        }
        
        // Save initiation
        showConfirmModal(() => {
          saveScan({
            seedId : res.seedId,
            name : res.name,
            cbo : res.cbo,
            uicValue: uicValue,
            visitValue: visitValue,
            kapValue: kapValue,
            loggerValue: loggerValue
          });
        });
    };

    // cancel button function
    document.getElementById('cancelBtn').addEventListener('click', () => {
    document.getElementById('result').innerHTML = "";
    document.getElementById("startScanBtn").disabled = false;
    document.getElementById("startScanBtn").style.opacity = "100%";
    document.getElementById("uploadQRBtn").disabled = false;
    document.getElementById("uploadQRBtn").style.opacity = "100%";
    }) 
    
  })
  .catch(err => {
    console.error(err);
    showToast("Search failed");
  });
}

// Manual search by ID input
function searchById() {
  document.getElementById("gIdManual").disabled = true;
  document.getElementById("gIdManual").style.opacity = "50%";
  document.getElementById("searchManual").disabled = true;
  document.getElementById("searchManual").style.opacity = "50%";
  
  const idValue = document.getElementById("gIdManual").value;

  if (!idValue) {
    showToast("Please enter a Seed ID.");
    document.getElementById("gIdManual").disabled = false;
    document.getElementById("gIdManual").style.opacity = "100%";
    document.getElementById("searchManual").disabled = false;
    document.getElementById("searchManual").style.opacity = "100%";
    return;
  }

  fetch(
   "https://script.google.com/macros/s/AKfycbwYhaIIxax9_IjEqW6KlK8p7l2eMiB7zDhEJwI350SeEl-3oxt4T1WNnHn0VyUgmlFz/exec", {
    method: "POST",
    body: JSON.stringify({
      action: "searchById",
      idValue: idValue
    })
  })
  .then(res => res.json())
  .then(res => {
    if (!res.found) {
      document.getElementById("manualResult").innerHTML = "<p>No match found</p>";
      document.getElementById("gIdManual").disabled = false;
      document.getElementById("gIdManual").style.opacity = "100%";
      document.getElementById("searchManual").disabled = false;
      document.getElementById("searchManual").style.opacity = "100%";
      return;
    }
    
    // render results from manual search if match is found 
    document.getElementById("manualResult").innerHTML = `
      <div class="resultsDiv">
        <table class="resultsTable">
          <tr>
            <td colspan="2" style="font-weight: bold; background: #0c1134; padding: 4px;">Seed Details</td>
          </tr>
          <tr>
            <td>Seed ID</td>
            <td>${res.seedId}</td>
          </tr>
          <tr>
            <td>Name</td>
            <td>${res.name}</td>
          </tr>
          <tr>
            <td>CBO</td>
            <td>${res.cbo}</td>
          </tr>
        </table>
      </div>
      <h4 style="color: white; margin-bottom: 3px; border-radius: 8px; background: #0c1134; padding 3px;">Client Details</h4>
      <div id="clientDetailsManual">
      <label class="clientFieldLabel">Client UIC</label>
      <input type="text" placeholder="example: MAJO0112011999" class="clientFields" id="uicInputManual"/>
      <label class="clientFieldLabel">Date of Visit</label>
      <input type="date" class="clientFields" id="dateVisitInputManual"/>
      <label class="clientFieldLabel">KAP Group</label>
      <select id="kapGroupSelectManual" class="clientFields">
        <option value="" selected disabled hidden>Select KAP Group</option>
        <option value="MSM">MSM (Men having Sex with other Men)</option>
        <option value="TGW">TGW (Transgender Women)</option>
      </select>
      <label class="clientFieldLabel">Logged By:</label>
      <input type="text" id="loggedByInputManual" class="clientFields"/>
      </div>    
    `;

    // UIC formatting
    const uicInputManual = document.getElementById('uicInputManual');
    uicInputManual.addEventListener("input", function () {
      let uicForm = this.value.replace(/[^a-zA-Z0-9]/g, '');
      let uicLetters = uicForm.substring(0, 4).replace(/[^a-zA-Z]/g, '').toUpperCase();
      let uicNumbers = uicForm.substring(4).replace(/[^0-9]/g, '').substring(0, 10);
      let formatted = uicLetters + uicNumbers;
      this.value = formatted.substring(0, 14)
    })
    
    // create save button
    const saveBtn = document.createElement('button');
    saveBtn.innerText = 'Save';
    saveBtn.id = 'saveBtn';
    document.getElementById('manualResult').appendChild(saveBtn);

    // create cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.innerText = 'Cancel';
    cancelBtn.id = 'cancelBtn';
    document.getElementById('manualResult').appendChild(cancelBtn);
    
    // save button on click
    saveBtn.onclick = () => {
        document.getElementById("saveBtn").disabled = true;
        document.getElementById("saveBtn").style.opacity = "50%";
        document.getElementById("cancelBtn").disabled = true;
        document.getElementById("cancelBtn").style.opacity = "50%";
      
        // Store input values into variables
        const uicValue = document.getElementById('uicInputManual').value;
        const visitValue = document.getElementById('dateVisitInputManual').value;
        const kapValue = document.getElementById('kapGroupSelectManual').value;
        const loggerValue = document.getElementById('loggedByInputManual').value;

        // Highlight blank fields
        const fields = [
          document.getElementById('uicInputManual'),
          document.getElementById('dateVisitInputManual'),
          document.getElementById('kapGroupSelectManual'),
          document.getElementById('loggedByInputManual')
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
          document.getElementById("saveBtn").disabled = false;
          document.getElementById("saveBtn").style.opacity = "100%";
          document.getElementById("cancelBtn").disabled = false;
          document.getElementById("cancelBtn").style.opacity = "100%";
          return;
        }
        
        // Save initiation
        showConfirmModal(() => {
          saveScan({
            seedId : res.seedId,
            name : res.name,
            cbo : res.cbo,
            uicValue: uicValue,
            visitValue: visitValue,
            kapValue: kapValue,
            loggerValue: loggerValue
          });
        });
    };

    // cancel button function
    document.getElementById('cancelBtn').addEventListener('click', () => {
    document.getElementById('manualResult').innerHTML = "";
    document.getElementById("startScanBtn").disabled = false;
    document.getElementById("startScanBtn").style.opacity = "100%";
    document.getElementById("uploadQRBtn").disabled = false;
    document.getElementById("uploadQRBtn").style.opacity = "100%";
    document.getElementById("gIdManual").disabled = false;
    document.getElementById("gIdManual").style.opacity = "100%";
    document.getElementById("searchManual").disabled = false;
    document.getElementById("searchManual").style.opacity = "100%";
    }) 
    
  })
  .catch(err => {
    console.error(err);
    showToast("Search failed");
  });
};

// toast function
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
    sessionToken: localStorage.getItem("sessionToken"),
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
 
  // remove loading modal AFTER successful save
document.getElementById("activeModal")?.remove();
  // clear results contents after successful save and re-enable buttons
document.getElementById("result").innerHTML = "";
document.getElementById("manualResult").innerHTML = "";
document.getElementById("startScanBtn").disabled = false;
document.getElementById("startScanBtn").style.opacity = "100%";
document.getElementById("uploadQRBtn").disabled = false;
document.getElementById("uploadQRBtn").style.opacity = "100%";
document.getElementById("gIdManual").disabled = false;
document.getElementById("gIdManual").style.opacity = "100%";
document.getElementById("searchManual").disabled = false;
document.getElementById("searchManual").style.opacity = "100%";

showToast('Save Successful');
})
  .catch(err => {
    console.error(err);
    showToast("Save failed");

    // remove modal on failure too
    document.querySelector(".modal")?.remove();
  });
}

// Update mode function
function updateMode() {

  document.getElementById("result").innerHTML = "";
  document.getElementById("manualResult").innerHTML = "";
  document.getElementById("result").innerHTML = "";
  document.getElementById("manualResult").innerHTML = "";
  document.getElementById("startScanBtn").disabled = false;
  document.getElementById("startScanBtn").style.opacity = "100%";
  document.getElementById("uploadQRBtn").disabled = false;
  document.getElementById("uploadQRBtn").style.opacity = "100%";
  document.getElementById("gIdManual").disabled = false;
  document.getElementById("gIdManual").style.opacity = "100%";
  document.getElementById("searchManual").disabled = false;
  document.getElementById("searchManual").style.opacity = "100%";
  
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

// for confirmation modal
function showConfirmModal(onConfirm) {
  // Confirm submission
  const modalBgd = document.createElement('div');
  modalBgd.className = "modal";
  modalBgd.style.display = "block";
  modalBgd.id = "activeModal";
  document.body.appendChild(modalBgd);
  
  const confModal = document.createElement('div');
  confModal.className = "modal-content";
  confModal.id = "fnlConfModal";
  confModal.style.display = "block";
  confModal.innerHTML = `
    <h2>Confirmation</h2>
    <h5>Are you sure you want to submit?</h5>
    <button id="fnlsbmt">Yes</button>
    <button id="fnlCncl">No</button>`;
  modalBgd.appendChild(confModal);
  
  // Yes on click
  document.getElementById('fnlsbmt').onclick = () => {
    confModal.innerHTML = `
      <div class="spinner"></div>
      <h3>Saving...</h3>
    `;
    confModal.style.pointerEvents = "none";
    setTimeout(() => {
      onConfirm();
    }, 100);
  }
  
  document.getElementById('fnlCncl').onclick = () => {
  modalBgd.remove();
  document.getElementById("saveBtn").disabled = false;
  document.getElementById("saveBtn").style.opacity = "100%";
  document.getElementById("cancelBtn").disabled = false;
  document.getElementById("cancelBtn").style.opacity = "100%";
  };
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

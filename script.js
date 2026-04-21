let qrReader;
let currentCamera = "environment"

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById('main-section').style.display = 'block';
  document.getElementById('scanSection').style.display = 'block';
  document.getElementById('manualSection').style.display = 'none';
  
  const modeSwitch = document.getElementById("modeSwitch");
  const modeLabel = document.getElementById("modeLabel");

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

    modeSwitch.addEventListener("change", updateMode);
    updateMode(); // set default view on load

    const gIdManual = document.getElementById('gIdManual');
    const searchManual = document.getElementById('searchManual');
 
});


function disableModeToggle() {
  const modeSwitch = document.getElementById("modeSwitch");
  modeSwitch.disabled = true;
  modeSwitch.parentElement.style.opacity = "0.5";
  document.getElementById("modeLabel").style.opacity = "0.5";
}

function enableModeToggle() {
  const modeSwitch = document.getElementById("modeSwitch");
  modeSwitch.disabled = false;
  modeSwitch.parentElement.style.opacity = "1";
  document.getElementById("modeLabel").style.opacity = "1";
}

function stopScanner() {
  if (qrReader) {
    qrReader.stop()
    .then(() => {qrReader.clear()})
    .catch(err => console.error("Failed to stop scanner", err));
    enableModeToggle();
  }
}

const stopBtn = document.getElementById("stopScanBtn");
const flipBtn = document.getElementById("flipCamBtn");

  flipBtn.addEventListener("click", function() {
  currentCamera = currentCamera === "environment" ? "user" : "environment";
  stopScanner();
  setTimeout(startScanner, 500);;
});

stopBtn.addEventListener("click", function(){
  stopScanner();
  startScanBtn.disabled = false;
  startScanBtn.innerText = "Start Scanner";
  stopBtn.style.display = "none";
  flipBtn.style.display = "none";
});

document.getElementById('startScanBtn').addEventListener('click', function() {
  let startScanBtn = document.getElementById('startScanBtn');
  startScanBtn.innerText = "loading...";   // show "Saving..."
  startScanBtn.disabled = true;           // prevent double-clicks
  disableModeToggle();

  startScanner();
  stopBtn.style.display = "inline-block";
  flipBtn.style.display = "inline-block";
});

function startScanner() {
  qrReader = new Html5Qrcode('qr-reader');
  qrReader.start(
    { facingMode: currentCamera },
    { fps: 10, qrbox: 250 },
    (decodedText) => {
      qrReader.stop();
      stopBtn.style.display = "none";
      flipBtn.style.display = "none";
      document.getElementById('result').innerHTML = "<p>Searching...</p>";
    }
  ).then(() => console.log("Scanner started"))
  .catch(err => {
    console.error(err);
    showToast("Camera error: " + err);
  });
}

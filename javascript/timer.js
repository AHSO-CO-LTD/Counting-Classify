let timerInterval;
let lostTimeInterval;
let totalInterval;
let elapsedTime = 0;
let lostElapsedTime = 0;
let totalElapsedTime = 0;
let storedTotalTime = 0;

function formatTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
    2,
    "0"
  );
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function startLostTime() {
  const lostStartTime = Date.now() - lostElapsedTime;
  lostTimeInterval = setInterval(() => {
    lostElapsedTime = Date.now() - lostStartTime;
    document.getElementById("footer-lost-time").textContent =
      formatTime(lostElapsedTime);
  }, 1000);
}

function stopLostTime() {
  clearInterval(lostTimeInterval);
  lostTimeInterval = null;
}

function resetAll() {
  elapsedTime = 0;
  lostElapsedTime = 0;
  totalElapsedTime = 0;
  document.getElementById("footer-time").textContent = "00:00:00";
  document.getElementById("footer-lost-time").textContent = "00:00:00";
  document.getElementById("footer-total").textContent = "00:00:00";
  clearInterval(timerInterval);
  clearInterval(lostTimeInterval);
  timerInterval = null;
  lostTimeInterval = null;
  totalInterval = null;
  showStatus("Reset time.", "inactive");
}

function checkCountValues() {
  if (elements.countActual.textContent === elements.inputStandard.value) {
    clearInterval(timerInterval);
    timerInterval = null;
    elapsedTime = 0;
    document.getElementById("footer-time").textContent = "00:00:00";
  }
}

const timeCount = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    if (!lostTimeInterval) {
      startLostTime();
    }
  } else {
    const startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(() => {
      elapsedTime = Date.now() - startTime;
      document.getElementById("footer-time").textContent =
        formatTime(elapsedTime);
    }, 1000);
    stopLostTime();
  }
};

function startTotalTime() {
  const startTime = Date.now() - totalElapsedTime;
  totalInterval = setInterval(() => {
    totalElapsedTime = Date.now() - startTime;
    document.getElementById("footer-total").textContent =
      formatTime(totalElapsedTime);
  }, 1000);
}
function stopTotalTime() {
  clearInterval(totalInterval);
  totalInterval = null;
}

document.getElementById("reset-button").addEventListener("click", () => {
  resetAll();
});

function timeToMilliseconds(timeString) {
  const parts = timeString.split(":");
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseInt(parts[2], 10);
  return (hours * 3600 + minutes * 60 + seconds) * 1000;
}

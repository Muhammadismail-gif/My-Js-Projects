let startTime, updatedTime, difference, tInterval;
let running = false;
let laps = [];

const display = document.getElementById('display');
const startStopBtn = document.getElementById('startStopBtn');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');
const lapsList = document.getElementById('laps');

startStopBtn.addEventListener('click', () => {
  if (!running) {
    startTime = Date.now() - (difference || 0);
    tInterval = setInterval(updateTime, 10);
    running = true;
    startStopBtn.textContent = 'Pause';
    lapBtn.disabled = false;
    resetBtn.disabled = false;
  } else {
    clearInterval(tInterval);
    running = false;
    startStopBtn.textContent = 'Start';
  }
});

resetBtn.addEventListener('click', () => {
  clearInterval(tInterval);
  running = false;
  difference = 0;
  display.textContent = '00:00:00.000';
  startStopBtn.textContent = 'Start';
  lapBtn.disabled = true;
  resetBtn.disabled = true;
  laps = [];
  updateLaps();
});

lapBtn.addEventListener('click', () => {
  if (running) {
    laps.push(display.textContent);
    updateLaps();
  }
});

function updateTime() {
  updatedTime = Date.now();
  difference = updatedTime - startTime;

  let hours = Math.floor(difference / 3600000);
  let minutes = Math.floor((difference % 3600000) / 60000);
  let seconds = Math.floor((difference % 60000) / 1000);
  let milliseconds = difference % 1000;

  display.textContent = 
    (hours < 10 ? "0" + hours : hours) + ":" +
    (minutes < 10 ? "0" + minutes : minutes) + ":" +
    (seconds < 10 ? "0" + seconds : seconds) + "." +
    (milliseconds < 100 ? (milliseconds < 10 ? "00" + milliseconds : "0" + milliseconds) : milliseconds);
}

function updateLaps() {
  lapsList.innerHTML = '';
  laps.forEach((lap, index) => {
    const li = document.createElement('li');
    li.textContent = `Lap ${index + 1}: ${lap}`;
    lapsList.appendChild(li);
  });
}

// ========================================
// StudyFlow Timer
// ========================================


// -----------------------------
// DOM
// -----------------------------

const timer = document.getElementById("timer");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const timerProgress =
  document.getElementById("timerProgress");

const status =
  document.getElementById("status");

const date =
  document.getElementById("date");

const todayStudy =
  document.getElementById("todayStudy");

const dailyGoal =
  document.getElementById("dailyGoal");

const streak =
  document.getElementById("streak");

const progressFill =
  document.getElementById("progressFill");

const progressText =
  document.getElementById("progressText");

const progressTime =
  document.getElementById("progressTime");

const remainingText =
  document.getElementById("remainingText");

const goalText =
  document.getElementById("goalText");

const goalInput =
  document.getElementById("goalInput");

const saveGoal =
  document.getElementById("saveGoal");


// -----------------------------
// Timer variables
// -----------------------------

let totalSeconds = 60 * 60;

let remainingSeconds = totalSeconds;

let interval = null;

let running = false;


// Circle

const radius = 132;

const circumference =
  2 * Math.PI * radius;

timerProgress.style.strokeDasharray =
  circumference;

timerProgress.style.strokeDashoffset = 0;


// -----------------------------
// Local Storage
// -----------------------------

const todayKey =
  new Date().toISOString().split("T")[0];


let data =
  JSON.parse(
    localStorage.getItem("studyFlow")
  ) || {};


// Create today's data

if (!data[todayKey]) {

  data[todayKey] = {

    studied: 0,

    goal: 120

  };

  saveData();
}


// -----------------------------
// Save
// -----------------------------

function saveData() {

  localStorage.setItem(
    "studyFlow",
    JSON.stringify(data)
  );
}


// -----------------------------
// Format Timer
// -----------------------------

function formatTime(seconds) {

  const minutes =
    Math.floor(seconds / 60);

  const secondsLeft =
    seconds % 60;

  return (
    String(minutes).padStart(2, "0")
    +
    ":"
    +
    String(secondsLeft).padStart(2, "0")
  );
}


// -----------------------------
// Update Timer
// -----------------------------

function updateTimer() {

  timer.textContent =
    formatTime(remainingSeconds);


  const progress =
    1 -
    remainingSeconds / totalSeconds;


  const offset =
    circumference -
    progress * circumference;


  timerProgress.style.strokeDashoffset =
    offset;
}


// -----------------------------
// Start
// -----------------------------

function startTimer() {

  if (running) return;


  running = true;


  status.classList.add("running");

  status.lastChild.textContent =
    " Studying";


  interval = setInterval(() => {

    if (remainingSeconds <= 0) {

      completeSession();

      return;
    }


    remainingSeconds--;

    updateTimer();

  }, 1000);
}


// -----------------------------
// Pause
// -----------------------------

function pauseTimer() {

  if (!running) return;


  clearInterval(interval);

  running = false;


  status.classList.remove("running");

  status.lastChild.textContent =
    " Paused";
}


// -----------------------------
// Reset
// -----------------------------

function resetTimer() {

  clearInterval(interval);

  running = false;

  remainingSeconds =
    totalSeconds;


  status.classList.remove("running");

  status.lastChild.textContent =
    " Ready";


  updateTimer();
}


// -----------------------------
// Complete
// -----------------------------

function completeSession() {

  clearInterval(interval);

  running = false;


  const minutes =
    Math.round(totalSeconds / 60);


  data[todayKey].studied += minutes;


  saveData();


  remainingSeconds =
    totalSeconds;


  status.classList.remove("running");

  status.lastChild.textContent =
    " Completed";


  updateTimer();

  updateDashboard();
}


// -----------------------------
// Presets
// -----------------------------

document
  .querySelectorAll(".presets button")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const minutes =
          Number(
            button.dataset.time
          );


        totalSeconds =
          minutes * 60;

        remainingSeconds =
          totalSeconds;


        document
          .querySelectorAll(".presets button")
          .forEach(btn =>
            btn.classList.remove("active")
          );


        button.classList.add("active");


        resetTimer();

      }
    );

  });


// -----------------------------
// Dashboard
// -----------------------------

function updateDashboard() {

  const studied =
    data[todayKey].studied;

  const goal =
    data[todayKey].goal;


  todayStudy.textContent =
    formatMinutes(studied);


  dailyGoal.textContent =
    `${goal}m`;


  goalInput.value =
    goal;


  goalText.textContent =
    `${goal} min`;


  const percentage =
    Math.min(
      (studied / goal) * 100,
      100
    );


  progressFill.style.width =
    `${percentage}%`;


  progressText.textContent =
    `${Math.round(percentage)}%`;


  progressTime.textContent =
    `${studied} min studied`;


  const remaining =
    Math.max(goal - studied, 0);


  remainingText.textContent =
    `${remaining} min left`;


  calculateStreak();
}


// -----------------------------
// Format Study Time
// -----------------------------

function formatMinutes(minutes) {

  if (minutes < 60) {

    return `${minutes}m`;

  }


  const hours =
    Math.floor(minutes / 60);

  const mins =
    minutes % 60;


  if (mins === 0) {

    return `${hours}h`;

  }


  return `${hours}h ${mins}m`;
}


// -----------------------------
// Streak
// -----------------------------

function calculateStreak() {

  let count = 0;

  let current =
    new Date();


  while (true) {

    const key =
      current.toISOString().split("T")[0];


    if (
      data[key] &&
      data[key].studied > 0
    ) {

      count++;

      current.setDate(
        current.getDate() - 1
      );

    } else {

      break;

    }

  }


  streak.textContent =
    `${count}d`;
}


// -----------------------------
// Goal
// -----------------------------

saveGoal.addEventListener(
  "click",
  () => {

    const goal =
      Number(goalInput.value);


    if (
      !goal ||
      goal < 10 ||
      goal > 1440
    ) {

      return;

    }


    data[todayKey].goal =
      goal;


    saveData();

    updateDashboard();

  }
);


// -----------------------------
// Buttons
// -----------------------------

startBtn.addEventListener(
  "click",
  startTimer
);


pauseBtn.addEventListener(
  "click",
  pauseTimer
);


resetBtn.addEventListener(
  "click",
  resetTimer
);


// -----------------------------
// Date
// -----------------------------

date.textContent =
  new Date().toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric"
    }
  );


// -----------------------------
// Initial
// -----------------------------

updateTimer();

updateDashboard();


// Lucide icons

lucide.createIcons();
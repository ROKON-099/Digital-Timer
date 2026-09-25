// ========================================
// STUDYFLOW - STUDY TIMER
// ========================================


// ========================================
// DOM ELEMENTS
// ========================================

const timer = document.getElementById("timer");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const timerProgress =
  document.getElementById("timerProgress");

const status =
  document.getElementById("status");

const dateElement =
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


// ========================================
// TIMER VARIABLES
// ========================================

// Default timer = 60 minutes

let totalSeconds = 60 * 60;

let remainingSeconds = totalSeconds;


// Timer interval

let timerInterval = null;


// Timer running status

let running = false;


// Timestamp when current timer session started

let sessionStartedAt = null;


// Seconds that were already counted
// into today's study time

let countedSeconds = 0;


// ========================================
// CIRCLE TIMER
// ========================================

const radius = 132;

const circumference =
  2 * Math.PI * radius;


// Set circle size

timerProgress.style.strokeDasharray =
  circumference;


// Initially full circle

timerProgress.style.strokeDashoffset = 0;


// ========================================
// LOCAL STORAGE KEY
// ========================================

const STORAGE_KEY = "studyFlowData";


// ========================================
// GET LOCAL DATE
// ========================================

// Important:
// Don't use toISOString() here because
// Bangladesh timezone can change the date.

function getDateKey(date = new Date()) {

  const year =
    date.getFullYear();

  const month =
    String(date.getMonth() + 1)
      .padStart(2, "0");

  const day =
    String(date.getDate())
      .padStart(2, "0");

  return `${year}-${month}-${day}`;
}


// Today's key

const todayKey =
  getDateKey();


// ========================================
// LOAD DATA
// ========================================

let data =
  JSON.parse(
    localStorage.getItem(STORAGE_KEY)
  );


// If no data exists

if (!data) {

  data = {

    days: {},

    settings: {

      dailyGoal: 120

    },

    activeTimer: null

  };

}


// ========================================
// MAKE SURE DATA STRUCTURE EXISTS
// ========================================

if (!data.days) {

  data.days = {};

}


if (!data.settings) {

  data.settings = {

    dailyGoal: 120

  };

}


// ========================================
// CREATE TODAY
// ========================================

if (!data.days[todayKey]) {

  data.days[todayKey] = {

    studySeconds: 0,

    goal: data.settings.dailyGoal

  };

}


// ========================================
// SAVE DATA
// ========================================

function saveData() {

  localStorage.setItem(

    STORAGE_KEY,

    JSON.stringify(data)

  );

}


// Save immediately

saveData();


// ========================================
// TIMER FORMAT
// ========================================

function formatTime(seconds) {

  seconds =
    Math.max(0, Math.floor(seconds));


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


// ========================================
// FORMAT STUDY TIME
// ========================================

function formatStudyTime(seconds) {

  const minutes =
    Math.floor(seconds / 60);


  if (minutes < 60) {

    return `${minutes}m`;

  }


  const hours =
    Math.floor(minutes / 60);


  const remainingMinutes =
    minutes % 60;


  if (remainingMinutes === 0) {

    return `${hours}h`;

  }


  return `${hours}h ${remainingMinutes}m`;

}


// ========================================
// UPDATE TIMER DISPLAY
// ========================================

function updateTimerDisplay() {

  timer.textContent =
    formatTime(remainingSeconds);


  // How much timer has been completed

  const progress =
    1 -
    remainingSeconds / totalSeconds;


  const offset =
    circumference -
    progress * circumference;


  timerProgress.style.strokeDashoffset =
    offset;
}


// ========================================
// GET TODAY OBJECT
// ========================================

function getTodayData() {

  if (!data.days[todayKey]) {

    data.days[todayKey] = {

      studySeconds: 0,

      goal: data.settings.dailyGoal

    };

  }


  return data.days[todayKey];
}


// ========================================
// UPDATE DASHBOARD
// ========================================

function updateDashboard() {

  const today =
    getTodayData();


  const studySeconds =
    today.studySeconds;


  const studyMinutes =
    Math.floor(
      studySeconds / 60
    );


  const goalMinutes =
    today.goal;


  // =========================
  // Today
  // =========================

  todayStudy.textContent =
    formatStudyTime(studySeconds);


  // =========================
  // Goal
  // =========================

  dailyGoal.textContent =
    `${goalMinutes}m`;


  goalInput.value =
    goalMinutes;


  goalText.textContent =
    `${goalMinutes} min`;


  // =========================
  // Progress
  // =========================

  const progress =
    goalMinutes > 0

      ? Math.min(
          (studyMinutes / goalMinutes) * 100,
          100
        )

      : 0;


  progressFill.style.width =
    `${progress}%`;


  progressText.textContent =
    `${Math.round(progress)}%`;


  progressTime.textContent =
    `${studyMinutes} min studied`;


  // =========================
  // Remaining
  // =========================

  const remaining =
    Math.max(
      goalMinutes - studyMinutes,
      0
    );


  remainingText.textContent =
    `${remaining} min left`;


  // =========================
  // Streak
  // =========================

  calculateStreak();

}


// ========================================
// CALCULATE STREAK
// ========================================

function calculateStreak() {

  let streakCount = 0;


  const currentDate =
    new Date();


  while (true) {

    const key =
      getDateKey(currentDate);


    const day =
      data.days[key];


    // At least 1 minute studied

    if (
      day &&
      day.studySeconds >= 60
    ) {

      streakCount++;


      currentDate.setDate(
        currentDate.getDate() - 1
      );

    }

    else {

      break;

    }

  }


  streak.textContent =
    `${streakCount}d`;
}


// ========================================
// START TIMER
// ========================================

function startTimer() {

  // Already running

  if (running) {

    return;

  }


  running = true;


  // Start timestamp

  sessionStartedAt =
    Date.now();


  // Start counting from zero
  // for this running session

  countedSeconds = 0;


  // UI

  status.classList.add("running");

  status.lastChild.textContent =
    " Studying";


  // Save active timer

  saveActiveTimer();


  // Start interval

  timerInterval =
    setInterval(

      updateRunningTimer,

      1000

    );


  // Immediately update

  updateRunningTimer();

}


// ========================================
// UPDATE RUNNING TIMER
// ========================================

function updateRunningTimer() {

  if (
    !running ||
    !sessionStartedAt
  ) {

    return;

  }


  // ========================================
  // ACTUAL ELAPSED TIME
  // ========================================

  const elapsedSeconds =
    Math.floor(

      (
        Date.now() -
        sessionStartedAt
      ) / 1000

    );


  // ========================================
  // UPDATE COUNTDOWN
  // ========================================

  remainingSeconds =
    Math.max(

      totalSeconds -
      elapsedSeconds,

      0

    );


  updateTimerDisplay();


  // ========================================
  // STUDY TIME COUNT
  // ========================================

  const minutesElapsed =
    Math.floor(
      elapsedSeconds / 60
    );


  const minutesAlreadyCounted =
    Math.floor(
      countedSeconds / 60
    );


  // New complete minutes

  if (
    minutesElapsed >
    minutesAlreadyCounted
  ) {

    const newMinutes =
      minutesElapsed -
      minutesAlreadyCounted;


    // Add exact seconds to today's data

    const today =
      getTodayData();


    today.studySeconds +=
      newMinutes * 60;


    // Mark these seconds as counted

    countedSeconds =
      minutesElapsed * 60;


    // Save to localStorage

    saveData();


    // Update UI

    updateDashboard();

  }


  // ========================================
  // TIMER FINISHED
  // ========================================

  if (
    remainingSeconds <= 0
  ) {

    finishTimer();

  }


  // Save active timer

  saveActiveTimer();

}


// ========================================
// PAUSE TIMER
// ========================================

function pauseTimer() {

  if (!running) {

    return;

  }


  // Count latest elapsed time

  updateRunningTimer();


  // Stop interval

  clearInterval(timerInterval);

  timerInterval = null;


  running = false;


  sessionStartedAt = null;


  countedSeconds = 0;


  // Remove active timer

  data.activeTimer = null;


  saveData();


  // UI

  status.classList.remove(
    "running"
  );

  status.lastChild.textContent =
    " Paused";


  updateDashboard();

}


// ========================================
// RESET TIMER
// ========================================

function resetTimer() {

  // Stop timer

  clearInterval(timerInterval);

  timerInterval = null;


  running = false;


  sessionStartedAt = null;


  countedSeconds = 0;


  // Reset countdown

  remainingSeconds =
    totalSeconds;


  // Remove active timer

  data.activeTimer = null;


  saveData();


  // UI

  status.classList.remove(
    "running"
  );

  status.lastChild.textContent =
    " Ready";


  updateTimerDisplay();

}


// ========================================
// FINISH TIMER
// ========================================

function finishTimer() {

  // Clear interval

  clearInterval(timerInterval);

  timerInterval = null;


  running = false;


  sessionStartedAt = null;


  countedSeconds = 0;


  // Remove active timer

  data.activeTimer = null;


  saveData();


  // Reset timer

  remainingSeconds =
    totalSeconds;


  // UI

  status.classList.remove(
    "running"
  );

  status.lastChild.textContent =
    " Completed";


  updateTimerDisplay();

  updateDashboard();

}


// ========================================
// SAVE ACTIVE TIMER
// ========================================

function saveActiveTimer() {

  if (!running) {

    data.activeTimer = null;

    saveData();

    return;

  }


  data.activeTimer = {

    startedAt:
      sessionStartedAt,

    totalSeconds:
      totalSeconds,

    remainingSeconds:
      remainingSeconds

  };


  saveData();

}


// ========================================
// RESTORE TIMER AFTER REFRESH
// ========================================

function restoreTimer() {

  const active =
    data.activeTimer;


  // No active timer

  if (!active) {

    return;

  }


  // Validate

  if (
    !active.startedAt ||
    !active.totalSeconds
  ) {

    data.activeTimer = null;

    saveData();

    return;

  }


  totalSeconds =
    active.totalSeconds;


  const elapsedSinceRefresh =
    Math.floor(

      (
        Date.now() -
        active.startedAt

      ) / 1000

    );


  // If timer should have finished

  if (
    elapsedSinceRefresh >=
    totalSeconds
  ) {

    // Add remaining full minutes

    const minutes =
      Math.floor(
        totalSeconds / 60
      );


    const today =
      getTodayData();


    today.studySeconds +=
      minutes * 60;


    data.activeTimer = null;


    saveData();


    remainingSeconds =
      totalSeconds;


    updateTimerDisplay();

    updateDashboard();


    return;

  }


  // Restore remaining time

  totalSeconds =
    active.totalSeconds;


  remainingSeconds =
    Math.max(

      totalSeconds -
      elapsedSinceRefresh,

      0

    );


  // ========================================
  // IMPORTANT
  // Restore study time that happened
  // before page refresh
  // ========================================

  const elapsedMinutes =
    Math.floor(
      elapsedSinceRefresh / 60
    );


  if (elapsedMinutes > 0) {

    const today =
      getTodayData();


    today.studySeconds +=
      elapsedMinutes * 60;


    saveData();

  }


  // Continue timer

  running = true;


  sessionStartedAt =
    Date.now();


  countedSeconds = 0;


  status.classList.add(
    "running"
  );

  status.lastChild.textContent =
    " Studying";


  timerInterval =
    setInterval(
      updateRunningTimer,
      1000
    );


  updateTimerDisplay();

  updateDashboard();

}


// ========================================
// PRESET BUTTONS
// ========================================

const presetButtons =
  document.querySelectorAll(
    ".presets button"
  );


presetButtons.forEach(button => {

  button.addEventListener(
    "click",
    () => {

      const minutes =
        Number(
          button.dataset.time
        );


      // Invalid value

      if (
        !minutes ||
        minutes <= 0
      ) {

        return;

      }


      // Stop current timer

      clearInterval(timerInterval);

      timerInterval = null;


      running = false;

      sessionStartedAt = null;

      countedSeconds = 0;


      // Set new timer

      totalSeconds =
        minutes * 60;


      remainingSeconds =
        totalSeconds;


      // Remove active timer

      data.activeTimer = null;


      saveData();


      // Active button

      presetButtons.forEach(
        btn => {

          btn.classList.remove(
            "active"
          );

        }
      );


      button.classList.add(
        "active"
      );


      // UI

      status.classList.remove(
        "running"
      );

      status.lastChild.textContent =
        " Ready";


      updateTimerDisplay();

    }
  );

});


// ========================================
// SAVE DAILY GOAL
// ========================================

saveGoal.addEventListener(
  "click",
  () => {

    const goal =
      Number(
        goalInput.value
      );


    // Validation

    if (
      !Number.isFinite(goal) ||
      goal < 10 ||
      goal > 1440
    ) {

      goalInput.focus();

      return;

    }


    const today =
      getTodayData();


    today.goal =
      Math.floor(goal);


    data.settings.dailyGoal =
      Math.floor(goal);


    saveData();


    updateDashboard();

  }
);


// ========================================
// ENTER KEY FOR GOAL
// ========================================

goalInput.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter"
    ) {

      saveGoal.click();

    }

  }
);


// ========================================
// START BUTTON
// ========================================

startBtn.addEventListener(
  "click",
  startTimer
);


// ========================================
// PAUSE BUTTON
// ========================================

pauseBtn.addEventListener(
  "click",
  pauseTimer
);


// ========================================
// RESET BUTTON
// ========================================

resetBtn.addEventListener(
  "click",
  resetTimer
);


// ========================================
// DATE
// ========================================

dateElement.textContent =
  new Date().toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric"
    }
  );


// ========================================
// INITIALIZE
// ========================================

updateTimerDisplay();

updateDashboard();


// Restore running timer if page
// was refreshed while timer was running

restoreTimer();


// ========================================
// LUCIDE ICONS
// ========================================

if (
  typeof lucide !== "undefined"
) {

  lucide.createIcons();

}
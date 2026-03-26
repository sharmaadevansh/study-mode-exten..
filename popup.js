const btn = document.getElementById("toggleBtn");
const statusText = document.getElementById("statusText");
const timerDisplay = document.getElementById("timer");
const timerBtn = document.getElementById("timerBtn");

let interval = null;

// ================== TIME FORMAT ==================
function formatTime(sec) {
    const h = String(Math.floor(sec / 3600)).padStart(2, '0');
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
}

// ================== UPDATE TIMER DISPLAY ==================
function updateTimerDisplay() {
    chrome.storage.sync.get(["startTime"], (data) => {
        if (data.startTime) {
            const elapsed = Math.floor((Date.now() - data.startTime) / 1000);
            timerDisplay.textContent = formatTime(elapsed);
        } else {
            timerDisplay.textContent = "00:00:00";
        }
    });
}

// Run timer UI update every second
setInterval(updateTimerDisplay, 1000);

// ================== TIMER CONTROL ==================
function startTimer() {
    chrome.storage.sync.set({ startTime: Date.now() });
    timerBtn.textContent = "Stop Timer";
    timerBtn.classList.add("running");
}

function stopTimer() {
    chrome.storage.sync.remove("startTime");
    timerBtn.textContent = "Start Timer";
    timerBtn.classList.remove("running");
}

// Timer button click
timerBtn.addEventListener("click", () => {
    chrome.storage.sync.get(["startTime"], (data) => {
        if (data.startTime) {
            stopTimer();
        } else {
            startTimer();
        }
    });
});

// ================== STUDY MODE UI ==================
function updateUI(state) {
    if (state) {
        btn.textContent = "Disable Study Mode";
        btn.classList.remove("disabled");
        btn.classList.add("enabled");
        statusText.textContent = "Study Mode ON";
    } else {
        btn.textContent = "Enable Study Mode";
        btn.classList.remove("enabled");
        btn.classList.add("disabled");
        statusText.textContent = "Study Mode OFF";
    }
}

// Load saved state
chrome.storage.sync.get(["studyMode", "startTime"], (data) => {
    updateUI(data.studyMode);

    // Set timer button state correctly
    if (data.startTime) {
        timerBtn.textContent = "Stop Timer";
        timerBtn.classList.add("running");
    } else {
        timerBtn.textContent = "Start Timer";
        timerBtn.classList.remove("running");
    }

    updateTimerDisplay();
});

// ================== STUDY MODE TOGGLE ==================
btn.addEventListener("click", () => {
    chrome.storage.sync.get(["studyMode"], (data) => {
        const newState = !data.studyMode;

        chrome.storage.sync.set({ studyMode: newState });

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: newState ? "ENABLE" : "DISABLE"
                });
            }
        });

        updateUI(newState);
    });
});
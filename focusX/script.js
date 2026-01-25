let timeLeft = 25 * 60;
let isRunning = false;
let currentSession = 'work';
let workCount = 0;
let interval;
let workDuration = 25 * 60;
let shortBreakDuration = 5 * 60;
let longBreakDuration = 15 * 60;

const timerDisplay = document.getElementById('timer');
const sessionDisplay = document.getElementById('session');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const resetButton = document.getElementById('resetButton');
const workInput = document.getElementById('workInput');
const shortBreakInput = document.getElementById('shortBreakInput');
const longBreakInput = document.getElementById('longBreakInput');

// Status panel elements
const sessionsCompletedEl = document.getElementById('sessionsCompleted');
const nextBreakEl = document.getElementById('nextBreak');
const breakDurationEl = document.getElementById('breakDuration');
const currentStatusEl = document.getElementById('currentStatus');
const notificationBox = document.getElementById('notificationBox');
const notificationText = document.getElementById('notificationText');

// Calendar elements
const calendarGrid = document.getElementById('calendarGrid');
const monthYearEl = document.getElementById('monthYear');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');

let currentCalendarDate = new Date();
let completedDates = new Set(); // Track completed sessions by date

// Auto-update on input change
workInput.addEventListener('input', updateFromInputs);
shortBreakInput.addEventListener('input', updateFromInputs);
longBreakInput.addEventListener('input', updateFromInputs);

// Allow complete clearing of inputs
workInput.addEventListener('focus', function() {
    if (this.value === '100') this.select();
});
shortBreakInput.addEventListener('focus', function() {
    if (this.value === '5') this.select();
});
longBreakInput.addEventListener('focus', function() {
    if (this.value === '15') this.select();
});

// Spacebar to pause/resume
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        toggleTimer();
    }
});

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    sessionDisplay.textContent = getSessionName();
    
    // Update document title
    document.title = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} - ${getSessionName()}`;
    
    // Update status panel
    updateStatusPanel();
}

function updateStatusPanel() {
    // Update sessions completed
    sessionsCompletedEl.textContent = workCount;
    
    // Update next break info
    if (currentSession === 'work') {
        if ((workCount + 1) % 2 === 0) {
            nextBreakEl.textContent = 'Long Break';
            breakDurationEl.textContent = `${Math.floor(longBreakDuration / 60)} min`;
        } else {
            nextBreakEl.textContent = 'Short Break';
            breakDurationEl.textContent = `${Math.floor(shortBreakDuration / 60)} min`;
        }
    } else {
        nextBreakEl.textContent = 'Work Session';
        breakDurationEl.textContent = `${Math.floor(workDuration / 60)} min`;
    }
    
    // Update current status
    if (isRunning) {
        currentStatusEl.textContent = `⏱️ ${getSessionName()} in progress`;
        currentStatusEl.style.background = 'rgba(52, 199, 89, 0.3)';
    } else if (timeLeft === 0) {
        currentStatusEl.textContent = '✅ Session completed';
        currentStatusEl.style.background = 'rgba(52, 199, 89, 0.3)';
    } else {
        currentStatusEl.textContent = '⏸️ Paused';
        currentStatusEl.style.background = 'rgba(255, 149, 0, 0.3)';
    }
}

function getSessionName() {
    switch (currentSession) {
        case 'work': return 'Work Session';
        case 'shortBreak': return 'Short Break';
        case 'longBreak': return 'Long Break';
        default: return '';
    }
}

function toggleTimer() {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        showNotificationPopup(`🚀 ${getSessionName()} started!`);
        interval = setInterval(() => {
            timeLeft--;
            updateDisplay();
            if (timeLeft <= 0) {
                clearInterval(interval);
                isRunning = false;
                nextSession();
            }
        }, 1000);
    }
}

function pauseTimer() {
    if (isRunning) {
        clearInterval(interval);
        isRunning = false;
        showNotificationPopup('⏸️ Timer paused');
        updateDisplay();
    }
}

function resetTimer() {
    clearInterval(interval);
    isRunning = false;
    currentSession = 'work';
    workCount = 0;
    
    updateDurationsFromInputs();
    timeLeft = workDuration;
    updateDisplay();
    showNotificationPopup('🔄 Timer reset');
}

function updateDurationsFromInputs() {
    let totalWork = parseInt(workInput.value);
    // Allow empty or invalid input temporarily
    if (isNaN(totalWork) || totalWork <= 0 || workInput.value === '') {
        if (workInput.value === '') return; // Don't auto-fill while user is typing
        totalWork = 100;
        workInput.value = 100;
    }
    let numPomodoros = 4;
    workDuration = Math.floor((totalWork * 60) / numPomodoros);
    
    let shortBreak = parseInt(shortBreakInput.value);
    if (isNaN(shortBreak) || shortBreak <= 0 || shortBreakInput.value === '') {
        if (shortBreakInput.value === '') return;
        shortBreak = 5;
        shortBreakInput.value = 5;
    }
    shortBreakDuration = shortBreak * 60;
    
    let longBreak = parseInt(longBreakInput.value);
    if (isNaN(longBreak) || longBreak <= 0 || longBreakInput.value === '') {
        if (longBreakInput.value === '') return;
        longBreak = 15;
        longBreakInput.value = 15;
    }
    longBreakDuration = longBreak * 60;
}

function updateFromInputs() {
    if (!isRunning) {
        updateDurationsFromInputs();
        
        switch (currentSession) {
            case 'work':
                timeLeft = workDuration;
                break;
            case 'shortBreak':
                timeLeft = shortBreakDuration;
                break;
            case 'longBreak':
                timeLeft = longBreakDuration;
                break;
        }
        
        updateDisplay();
    }
}

function nextSession() {
    if (currentSession === 'work') {
        workCount++;
        if (workCount % 2 === 0) {
            currentSession = 'longBreak';
            timeLeft = longBreakDuration;
            showNotificationPopup(`🎉 Work completed! Long break started (${Math.floor(longBreakDuration / 60)} min)`);
        } else {
            currentSession = 'shortBreak';
            timeLeft = shortBreakDuration;
            showNotificationPopup(`✅ Work completed! Short break started (${Math.floor(shortBreakDuration / 60)} min)`);
        }
    } else {
        currentSession = 'work';
        timeLeft = workDuration;
        showNotificationPopup(`💪 Break over! Work session started (${Math.floor(workDuration / 60)} min)`);
    }
    updateDisplay();
    
    // Send browser notification
    showBrowserNotification(`${getSessionName()} started!`);
    
    // Auto-start next session
    setTimeout(() => {
        startTimer();
    }, 1000);
}

function showNotificationPopup(message) {
    notificationText.textContent = message;
    notificationBox.classList.add('show');
    
    setTimeout(() => {
        notificationBox.classList.remove('show');
    }, 3000);
}

function showBrowserNotification(message) {
    if ("Notification" in window) {
        if (Notification.permission === "granted") {
            new Notification("Pomodoro Timer", {
                body: message,
                icon: "🍅"
            });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification("Pomodoro Timer", {
                        body: message,
                        icon: "🍅"
                    });
                }
            });
        }
    }
}

// Calendar functions
function renderCalendar() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    // Update month/year display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    monthYearEl.textContent = `${monthNames[month]} ${year}`;
    
    // Clear calendar
    calendarGrid.innerHTML = '';
    
    // Add day headers
    const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.textContent = day;
        calendarGrid.appendChild(header);
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    // Add previous month's days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = daysInPrevMonth - i;
        calendarGrid.appendChild(day);
    }
    
    // Add current month's days
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day';
        day.textContent = i;
        
        // Check if it's today
        if (year === today.getFullYear() && 
            month === today.getMonth() && 
            i === today.getDate()) {
            day.classList.add('today');
        }
        
        calendarGrid.appendChild(day);
    }
    
    // Add next month's days to fill the grid
    const totalCells = calendarGrid.children.length - 7; // Subtract headers
    const remainingCells = 42 - totalCells - 7; // 6 rows * 7 days - current cells - headers
    for (let i = 1; i <= remainingCells; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = i;
        calendarGrid.appendChild(day);
    }
}

function markTodayAsCompleted() {
    const today = new Date();
    const dateKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    completedDates.add(dateKey);
}

prevMonthBtn.addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendar();
});

// Event listeners
startButton.addEventListener('click', toggleTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);

// Initialize
resetTimer();

// Initialize calendar
renderCalendar();

// Request notification permission on load
if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
}
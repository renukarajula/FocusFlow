console.log("Dashboard Connected2");

// ----------------------------
// Check Login
// ----------------------------

const loggedInUser = localStorage.getItem("loggedInUser");

if (!loggedInUser) {
    window.location.href = "login.html";
}

const user = JSON.parse(loggedInUser);

// ----------------------------
// Welcome Message
// ----------------------------

const welcomeMessage = document.getElementById("welcomeMessage");
const logoutBtn = document.getElementById("logoutBtn");

welcomeMessage.textContent = "Welcome, " + user.fullname + " 👋";

// ----------------------------
// Logout
// ----------------------------

logoutBtn.addEventListener("click", function () {

    localStorage.removeItem("loggedInUser");

    alert("Logout Successful!");

    window.location.href = "login.html";

});

// ----------------------------
// Task Management
// ----------------------------

const taskContainer = document.getElementById("taskContainer");
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const searchInput = document.getElementById("searchInput");
const allBtn = document.getElementById("allBtn");
const pendingBtn = document.getElementById("pendingBtn");
const completedBtn = document.getElementById("completedBtn");
const timerDisplay = document.getElementById("timerDisplay");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");
const priority = document.getElementById("priority");
const todaySessions = document.getElementById("todaySessions");
const todayFocusTime = document.getElementById("todayFocusTime");
const weekSessions = document.getElementById("weekSessions");
const monthSessions = document.getElementById("monthSessions");
const themeSelect = document.getElementById("themeSelect");
const workTime = document.getElementById("workTime");
const breakTimeInput = document.getElementById("breakTimeInput");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
function updateFilterButtons() {

    allBtn.classList.remove("active");
    pendingBtn.classList.remove("active");
    completedBtn.classList.remove("active");

    if (currentFilter === "all") {
        allBtn.classList.add("active");
    }

    if (currentFilter === "pending") {
        pendingBtn.classList.add("active");
    }

    if (currentFilter === "completed") {
        completedBtn.classList.add("active");
    }
}

searchInput.addEventListener("input", function () {

    loadTasks();
});
allBtn.addEventListener("click", function () {

    currentFilter = "all";

    loadTasks();

});

pendingBtn.addEventListener("click", function () {

    currentFilter = "pending";

    loadTasks();

});

completedBtn.addEventListener("click", function () {

    currentFilter = "completed";

    loadTasks();

});

// ----------------------------
// Edit Variables
// ----------------------------

let editMode = false;
let editTaskId = null;
let currentFilter = "all";
let timeLeft = 0;
//let timeLeft = 25 * 60;
//let timeLeft = 5;
let timer = null;

let isBreak = false;
let breakTime = 0;
// ----------------------------
// Add / Update Task
// ----------------------------

taskForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const taskValue = taskInput.value.trim();

    // Check empty task
    if (!taskValue) {
        alert("Please enter a task!");
        return;
    }

    const task = {

        title: taskValue,
        priority: priority.value

    };

    try {


        let response;

        // ----------------------------
        // Update Task
        // ----------------------------

        if (editMode) {

            response = await fetch(`http://localhost:3000/tasks/${editTaskId}`, {

                method: "PATCH",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(task)

            });

        }

        // ----------------------------
        // Add Task
        // ----------------------------

        else {

            task.completed = false;
            task.createdAt = new Date().toISOString();

            response = await fetch("http://localhost:3000/tasks", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(task)

            });

        }

        // ----------------------------
        // Success Check
        // ----------------------------

        if (!response.ok) {

            alert("Operation Failed!");
            return;

        }

        if (editMode) {

            alert("Task Updated Successfully!");

        } else {

            alert("Task Added Successfully!");

        }

        taskInput.value = "";

        editMode = false;
        editTaskId = null;

        taskForm.querySelector("button").textContent = "Add Task";

        loadTasks();

    } catch (error) {

        console.log(error);

        alert("Server not running!");

    }

});

// ----------------------------
// Load Tasks
// ----------------------------

async function loadTasks() {

    try {
         updateFilterButtons();

        const response = await fetch("http://localhost:3000/tasks");

        const tasks = await response.json();
        // ----------------------------
        // Task Statistics
        // ----------------------------

        totalTasks.textContent = tasks.length;

        pendingTasks.textContent = tasks.filter(function (task) {

            return !task.completed;

        }).length;

        completedTasks.textContent = tasks.filter(function (task) {

            return task.completed;

        }).length;
        const searchText = searchInput.value.toLowerCase();

        taskContainer.innerHTML = "";

        let taskCards = "";

        tasks
            .filter(function (task) {

                const matchesSearch = task.title
                    .toLowerCase()
                    .includes(searchText);

                if (currentFilter === "pending") {

                    return matchesSearch && !task.completed;

                }

                if (currentFilter === "completed") {

                    return matchesSearch && task.completed;

                }

                return matchesSearch;

            })
            .forEach(function (task) {


                taskCards += `
                <div class="task-card">

                   <h3>${task.title}</h3>

<p>
    Priority:
    <span class="priority-badge ${task.priority.toLowerCase()}">
        ${task.priority}
    </span>
</p>
<p>
    Status:
    <span class="status-badge ${task.completed ? "completed" : "pending"}">
        ${task.completed ? "Completed ✅" : "Pending ⏳"}
    </span>
</p>
                    <div class="task-actions">
                      <button
    class="complete-btn"
    onclick="completeTask('${task.id}')"
    ${task.completed ? "disabled" : ""}
>
    ${task.completed ? "Completed ✅" : "Complete"}
</button>

                        <button class="edit-btn" onclick="editTask('${task.id}')">
                            Edit
                        </button>

                        <button class="delete-btn" onclick="deleteTask('${task.id}')">
                            Delete
                        </button>

                    </div>

                </div>
            `;

            });

        taskContainer.innerHTML = taskCards;

    } catch (error) {

        console.log(error);

        alert("Failed to load tasks!");

    }

}

// ----------------------------
// Initial Load
// ----------------------------
updateTimer();
loadTasks();
loadFocusStats();

// ----------------------------
// Start Timer
// ----------------------------

startBtn.addEventListener("click", function () {

    if (timer !== null) {
        return;
    }

    timer = setInterval(function () {

        timeLeft--;

        updateTimer();
        if (timeLeft <= 0) {

            clearInterval(timer);

            timer = null;

            if (!isBreak) {

                const settings = JSON.parse(localStorage.getItem("settings"));

                const shortBreak = confirm(
                    `Work Session Completed!\n\nClick OK for ${settings.breakTime} Minute Break\nClick Cancel for 15 Minute Break`
                );

                if (shortBreak) {

                    breakTime = Number(settings.breakTime) * 60;

                } else {

                    breakTime = 15 * 60;

                }

                isBreak = true;

                timeLeft = breakTime;

                updateTimer();

                startBtn.click();

            } else {

    alert("Session Completed! 🎉");

    // Save completed session
    let sessions = JSON.parse(localStorage.getItem("focusSessions")) || [];

    const settings = JSON.parse(localStorage.getItem("settings")) || {
        workTime: 25
    };

    sessions.push({
        date: new Date().toISOString(),
        duration: Number(settings.workTime)
    });

    localStorage.setItem("focusSessions", JSON.stringify(sessions));

    loadFocusStats();

    isBreak = false;

    timeLeft = Number(settings.workTime) * 60;

    updateTimer();
}

        }

    }, 1000);

});
// ----------------------------
// Pause Timer
// ----------------------------

pauseBtn.addEventListener("click", function () {

    clearInterval(timer);

    timer = null;

});
// ----------------------------
// Reset Timer
// ----------------------------

resetBtn.addEventListener("click", function () {

    clearInterval(timer);

    timer = null;

    isBreak = false;

    breakTime = 0;

    timeLeft = 25 * 60;

    updateTimer();

});
// ----------------------------
// Update Timer
// ----------------------------

function updateTimer() {

    const minutes = Math.floor(timeLeft / 60);

    const seconds = timeLeft % 60;

    timerDisplay.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

}
// ----------------------------
// Load Focus Statistics
// ----------------------------

function loadFocusStats() {

    const sessions = JSON.parse(localStorage.getItem("focusSessions")) || [];

    const today = new Date();

    let todayCount = 0;
    let todayMinutes = 0;
    let weekCount = 0;
    let monthCount = 0;

    sessions.forEach(function (session) {

        const sessionDate = new Date(session.date);

        // Today's Sessions

        if (
            sessionDate.toDateString() === today.toDateString()
        ) {

            todayCount++;

            todayMinutes += session.duration;

        }

        // Weekly Sessions (Last 7 Days)

        const diffDays =
            (today - sessionDate) / (1000 * 60 * 60 * 24);

        if (diffDays <= 7) {

            weekCount++;

        }

        // Monthly Sessions

        if (
            sessionDate.getMonth() === today.getMonth() &&
            sessionDate.getFullYear() === today.getFullYear()
        ) {

            monthCount++;

        }

    });

    todaySessions.textContent = todayCount;

    todayFocusTime.textContent = todayMinutes + " min";

    weekSessions.textContent = weekCount;

    monthSessions.textContent = monthCount;

}

// ----------------------------
// Delete Task
// ----------------------------

async function deleteTask(id) {

    const confirmDelete = confirm("Are you sure you want to delete this task?");

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(`http://localhost:3000/tasks/${id}`, {

            method: "DELETE"

        });

        if (!response.ok) {

            alert("Failed to delete task!");
            return;

        }

        alert("Task Deleted Successfully!");

        loadTasks();

    } catch (error) {

        console.log(error);

        alert("Server not running!");

    }

}

// ----------------------------
// Complete Task
// ----------------------------

async function completeTask(id) {

    try {

        const response = await fetch(`http://localhost:3000/tasks/${id}`, {

            method: "PATCH",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                completed: true
            })

        });

        if (!response.ok) {

            alert("Failed to complete task!");
            return;

        }

        alert("Task Completed Successfully!");

        loadTasks();

    } catch (error) {

        console.log(error);

        alert("Server not running!");

    }

}
// ----------------------------
// Edit Task
// ----------------------------

async function editTask(id) {

    try {

        const response = await fetch(`http://localhost:3000/tasks/${id}`);

        const task = await response.json();

        taskInput.value = task.title;
        priority.value = task.priority;

        editMode = true;
        editTaskId = id;

        taskForm.querySelector("button").textContent = "Update Task";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        taskInput.focus();

    } catch (error) {

        console.log(error);

    }

}
// ----------------------------
// Save Settings
// ----------------------------

saveSettingsBtn.addEventListener("click", function () {

    const settings = {

        theme: themeSelect.value,

        workTime: workTime.value,

        breakTime: breakTimeInput.value

    };

    localStorage.setItem("settings", JSON.stringify(settings));
    document.body.className = settings.theme;

    alert("Settings Saved Successfully!");

});
// ----------------------------
// Load Settings
// ----------------------------

function loadSettings() {

    const settings = JSON.parse(localStorage.getItem("settings"));

    if (!settings) {

        return;

    }

    themeSelect.value = settings.theme;
    document.body.className = settings.theme;

    workTime.value = settings.workTime;

    breakTimeInput.value = settings.breakTime;
    timeLeft = Number(settings.workTime) * 60;

    updateTimer();

}

loadSettings();
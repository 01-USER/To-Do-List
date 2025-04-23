// Initial state structure
let state = {
  playerName: "Adventurer",
  level: 0,
  xp: 0,
  coins: 0,  // Changed from 25 to 0
  stats: {
    strength: 0,
    intelligence: 0,
    charisma: 0,
    creativity: 0
  },
  tasks: []
};

// Modal functions
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.add("active");
  // Prevent body scrolling when modal is open
  document.body.style.overflow = "hidden";
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove("active");
  document.body.style.overflow = "auto";
  
  // Reset form and button text
  const form = document.getElementById("newTaskForm");
  form.reset();
  delete form.dataset.editIndex;
  
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.textContent = 'Add Quest';
  }
}

// Close modal when clicking outside
window.onclick = function (event) {
  if (event.target.classList.contains("modal")) {
    closeModal(event.target.id);
  }
};

// Save state with error handling
function saveState() {
  try {
    localStorage.setItem("questManagerState", JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save state:", error);
    // Handle storage quota exceeded
    if (error.name === "QuotaExceededError") {
      alert("Storage limit reached. Please delete some tasks.");
    }
  }
}

// Update UI elements
function updateUI() {
  document.getElementById("playerName").textContent = state.playerName;
  document.getElementById("level").textContent = state.level;
  document.getElementById("xp").textContent = state.xp;
  document.getElementById("xpBar").style.width = `${state.xp}%`;

  // Update coins display and progress bar
  document.getElementById("coins").textContent = state.coins;
  const coinsProgress = (state.coins % 100);
  document.getElementById("coinsBar").style.width = `${coinsProgress}%`;

  if (state.coins >= 100) {
    // Optional: Add special effect when coins reach 100
    document.getElementById("coinsBar").classList.add("animate-pulse");
    setTimeout(() => {
      document.getElementById("coinsBar").classList.remove("animate-pulse");
    }, 1000);
  }

  document.getElementById("strength").textContent = state.stats.strength;
  document.getElementById("intelligence").textContent = state.stats.intelligence;
  document.getElementById("charisma").textContent = state.stats.charisma;
  document.getElementById("creativity").textContent = state.stats.creativity;

  updateTaskList();
  updateTaskCount();
}

// Update task list
function updateTaskList() {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  state.tasks.forEach((task, index) => {
    const taskElement = document.createElement("div");
    taskElement.className = `task-item bg-zinc-900 hover:shadow-md hover:bg-zinc-800 rounded-lg p-4 ${
      task.completed ? "opacity-70 completed" : ""
    } transform transition-all duration-300`;
    taskElement.dataset.timestamp = task.timestamp || Date.now();
    taskElement.dataset.rewardType = task.rewardType;
    taskElement.innerHTML = `
        <div class="flex flex-col lg:flex-row md:flex-row justify-between items-start">
            <div>
                <h3 class="font-bold ${task.completed ? "line-through" : ""}">${task.title}</h3>
                <p class="text-sm text-gray-400">${task.description || ""}</p>
            </div>
            <div class="flex mt-1 lg:m-0 md:m-0 items-center space-x-2">
                <span class="px-2 py-1 bg-purple-500/20 rounded-lg text-sm">
                    ${task.rewardType} +10
                </span>
                ${task.completed ? `
                    <button onclick="repeatTask(${index})" class="px-2 py-1 bg-purple-500/20 text-purple-500 rounded-lg hover:bg-purple-500/30 transition-colors duration-300" title="Repeat Task">
                        <i class="fas fa-redo"></i>
                    </button>
                ` : `
                    <button onclick="editTask(${index})" class="px-2 py-1 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500/30 transition-colors duration-300">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="completeTask(${index})" class="px-2 py-1 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors duration-300">
                        <i class="fas fa-check"></i>
                    </button>
                `}
                <button onclick="deleteTask(${index})" class="px-2 py-1 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors duration-300">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    taskList.appendChild(taskElement);
  });
}

// Add new task with validation
function addNewTask(event) {
  event.preventDefault();
  
  const title = document.getElementById("taskTitle").value.trim();
  const description = document.getElementById("taskDescription").value.trim();
  const rewardType = document.getElementById("taskRewardType").value;

  if (!title) {
    alert("Please enter a quest title");
    return;
  }

  if (!state.tasks) {
    state.tasks = [];  // Initialize tasks array if it doesn't exist
  }

  try {
    if (event.target.dataset.editIndex !== undefined) {
      // Edit existing task
      const index = parseInt(event.target.dataset.editIndex);
      state.tasks[index] = {
        ...state.tasks[index],
        title,
        description,
        rewardType
      };
      delete event.target.dataset.editIndex;
    } else {
      // Add new task
      const newTask = {
        title,
        description,
        rewardType,
        completed: false,
        timestamp: Date.now()
      };
      state.tasks.push(newTask);
    }

    saveState();
    updateUI();
    closeModal("newTaskModal");
    event.target.reset(); // Reset the form

    // Reset the submit button text
    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.textContent = 'Add Quest';
    }

    // Show success notification
    const notification = document.createElement("div");
    notification.className = "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50";
    notification.textContent = "Quest added successfully!";
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);

  } catch (error) {
    console.error("Error adding task:", error);
    alert("Failed to add quest. Please try again.");
  }
}

function editTask(index) {
  const task = state.tasks[index];
  
  // Open the modal and populate with existing task data
  const modal = document.getElementById('newTaskModal');
  const form = document.getElementById('newTaskForm');
  
  // Set existing values
  document.getElementById('taskTitle').value = task.title;
  document.getElementById('taskDescription').value = task.description;
  document.getElementById('taskRewardType').value = task.rewardType;
  
  // Add a data attribute to track editing mode
  form.dataset.editIndex = index;
  
  // Change the submit button text
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.textContent = 'Save Changes';
  }
  
  // Open the modal
  openModal('newTaskModal');
}

function animateCoinChange(amount) {
  const coinsElement = document.getElementById("coins");
  const coinsBar = document.getElementById("coinsBar");
  
  // Animate coins number
  coinsElement.classList.add("scale-110", "text-yellow-400");
  setTimeout(() => {
    coinsElement.classList.remove("scale-110", "text-yellow-400");
  }, 300);
  
  // Animate coins bar with percentage based on modulo 100
  const progress = (state.coins % 100);
  coinsBar.style.width = `${progress === 0 ? 100 : progress}%`;
  
  // Add pulse effect when coins are added
  coinsBar.classList.add("animate-pulse");
  setTimeout(() => {
    coinsBar.classList.remove("animate-pulse");
  }, 300);
}

function completeTask(index) {
  const task = state.tasks[index];
  task.completed = true;

  // Create progress bar with enhanced styling
  const taskElement = document.querySelector(`#taskList > div:nth-child(${index + 1})`);
  const progressBar = document.createElement("div");
  progressBar.className = "mt-4 w-full bg-gray-700 rounded-full h-2 overflow-hidden shadow-inner";
  progressBar.innerHTML = `
    <div class="progress-fill h-full w-0 bg-gradient-to-r from-green-500 via-emerald-500 to-green-300 
         transition-all duration-1000 shadow-lg transform"></div>
  `;
  taskElement.appendChild(progressBar);

  // Add rewards with enhanced animations
  const progressFill = progressBar.querySelector('.progress-fill');
  
  // Trigger progress bar animation
  setTimeout(() => {
    progressFill.style.width = '100%';
  }, 100);

  // Animate stats without text notification
  if (state.stats[task.rewardType] !== undefined) {
    state.stats[task.rewardType] += 10;
    const statElement = document.getElementById(task.rewardType);
    if (statElement) {
      animateStatChange(statElement);
    }
  }

  // Add XP and coins with enhanced animations
  state.xp += 10;
  state.coins += 5;
  animateCoinChange(5);
  
  // Save and update UI
  saveState();
  setTimeout(updateUI, 1500);
}

// Add this new function for floating text animation
function showFloatingText(parent, text) {
  const floatingText = document.createElement('div');
  floatingText.className = 'absolute right-4 text-lg font-bold text-purple-400 pointer-events-none';
  floatingText.style.animation = 'float-up 1.5s ease-out forwards';
  floatingText.textContent = text;
  
  parent.style.position = 'relative';
  parent.appendChild(floatingText);
  
  setTimeout(() => floatingText.remove(), 1500);
}

function deleteTask(index) {
  state.tasks.splice(index, 1);
  saveState();
  updateUI(); // Refresh the UI to remove the deleted task
}

function repeatTask(index) {
  const task = state.tasks[index];
  
  // Add rewards just like completing a task
  if (state.stats[task.rewardType] !== undefined) {
    state.stats[task.rewardType] += 10;
    // Animate the stat change
    const statElement = document.getElementById(task.rewardType);
    if (statElement) {
      animateStatChange(statElement);
    }
  }

  // Add XP and coins
  state.xp += 10;
  state.coins += 5;
  animateCoinChange(5);

  // Check for level up
  if (state.xp >= 100) {
    state.level += 1;
    state.xp = state.xp - 100;

    // Show level up notification
    const levelUpNotification = document.createElement("div");
    levelUpNotification.className = "fixed top-4 right-4 bg-purple-500 text-white px-4 py-2 rounded-lg shadow-lg z-50";
    levelUpNotification.textContent = `Level Up! You are now level ${state.level}`;
    document.body.appendChild(levelUpNotification);
    setTimeout(() => levelUpNotification.remove(), 3000);
  }
  
  // Save and update UI
  saveState();
  updateUI();
  
  // Show reward notification
  const notification = document.createElement("div");
  notification.className = "fixed top-4 right-4 bg-purple-500 text-white px-4 py-2 rounded-lg shadow-lg z-50";
  notification.textContent = `Reward claimed! +10 ${task.rewardType}, +10 XP, +5 coins`;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 2000);
}

function editName() {
  const newName = prompt("Enter your new name:", state.playerName);
  if (newName && newName.trim()) {
    state.playerName = newName.trim();
    saveState();
    updateUI();
  }
}

// Clear all tasks
function clearAllTasks() {
  if (confirm("Are you sure you want to clear all tasks?")) {
    state.tasks = [];
    saveState();
    updateUI(); // Refresh the UI to show an empty task list
  }
}

// Reset the application
function resetApp() {
  if (confirm("Are you sure you want to reset the app? This will clear all data.")) {
    state = {
      playerName: "Adventurer",
      level: 0,
      xp: 0,
      coins: 0,  // Changed from 25 to 0
      stats: {
        strength: 0,
        intelligence: 0,
        charisma: 0,
        creativity: 0
      },
      tasks: []
    };
    localStorage.removeItem("questManagerState");
    location.reload();
  }
}

// Handle keyboard events for modal
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    document.querySelectorAll(".modal.active").forEach((modal) => {
      closeModal(modal.id);
    });
  }
});

// Prevent form submission when pressing enter in input fields
document.querySelectorAll("input").forEach((input) => {
  input.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  });

  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  });
});

// Add animations for stats changes
function animateStatChange(statElement) {
  statElement.classList.add("scale-110", "text-purple-400");
  setTimeout(() => {
    statElement.classList.remove("scale-110", "text-purple-400");
  }, 300);
}

// Initialize app with proper state management
function initializeApp() {
  try {
    const savedState = localStorage.getItem("questManagerState");
    
    if (savedState) {
      // Load existing state
      state = JSON.parse(savedState);
    } else {
      // Set default tasks for new users
      state.tasks = [
        {
          title: "Fajar",
          description: "Waking Up For Fajar is The Best Way to Start Healing Yourself",
          rewardType: "strength",
          completed: false,
          timestamp: Date.now()
        },
        {
          title: "Zohar",
          description: "Blessings are showered on those who pray on time",
          rewardType: "strength",
          completed: false,
          timestamp: Date.now()
        },
        {
          title: "Asar",
          description: "Successful life here and after life",
          rewardType: "strength",
          completed: false,
          timestamp: Date.now()
        },
        {
          title: "Magreeb",
          description: "Allah will fulfil all your wishes and Duas",
          rewardType: "strength",
          completed: false,
          timestamp: Date.now()
        },
        {
          title: "Isha",
          description: "You will have a peaceful Night",
          rewardType: "strength",
          completed: false,
          timestamp: Date.now()
        }
      ];
      // Save initial state
      saveState();
    }

    // Update UI after state is set
    updateUI();
    
    // Hide loading screen
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.classList.add('opacity-0');
      setTimeout(() => loadingScreen.remove(), 500);
    }

  } catch (error) {
    console.error('Error initializing app:', error);
    // Show error to user
    const errorNotification = document.createElement("div");
    errorNotification.className = "fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg";
    errorNotification.textContent = "Error loading app data. Please refresh the page.";
    document.body.appendChild(errorNotification);
    setTimeout(() => errorNotification.remove(), 3000);
  }
}

// Initialize tooltips for buttons
function initializeTooltips() {
  const buttons = document.querySelectorAll("button");
  buttons.forEach((button) => {
    if (button.querySelector("i")) {
      button.setAttribute(
        "title",
        button.querySelector("i")?.className.includes("check")
          ? "Complete Quest"
          : button.querySelector("i")?.className.includes("trash")
          ? "Delete Quest"
          : "Button"
      );
    }
  });
}

// Automatically save state periodically
const saveStateInterval = setInterval(saveState, 10000); // Save every 10 seconds

// Filter tasks based on status
function filterTasks() {
  const filter = document.getElementById('taskFilter').value;
  const taskElements = document.querySelectorAll('.task-item');
  
  taskElements.forEach(task => {
    const isCompleted = task.classList.contains('completed');
    switch(filter) {
      case 'active':
        task.style.display = !isCompleted ? 'block' : 'none';
        break;
      case 'completed':
        task.style.display = isCompleted ? 'block' : 'none';
        break;
      default:
        task.style.display = 'block';
    }
  });
}

// Sort tasks based on criteria
function sortTasks() {
  const sortBy = document.getElementById('taskSort').value;
  const taskList = document.getElementById('taskList');
  const tasks = Array.from(taskList.children);
  
  tasks.sort((a, b) => {
    switch(sortBy) {
      case 'newest':
        return b.dataset.timestamp - a.dataset.timestamp;
      case 'oldest':
        return a.dataset.timestamp - b.dataset.timestamp;
      case 'reward':
        return a.dataset.rewardType.localeCompare(b.dataset.rewardType);
      default:
        return 0;
    }
  });
  
  taskList.innerHTML = '';
  tasks.forEach(task => taskList.appendChild(task));
}

// Update the task count in the UI
function updateTaskCount() {
  const total = state.tasks.length;
  const completed = state.tasks.filter(task => task.completed).length;
  document.getElementById('taskCount').textContent = `${completed}/${total}`;
}

// Start the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
  initializeTooltips();
});

// Cleanup before unloading the page
window.addEventListener("beforeunload", () => {
  clearInterval(saveStateInterval);
  window.removeEventListener("error", errorHandler);
});

// Create progress animation utility
function createProgressAnimation(element, duration = 1000) {
  return {
    start: (progress) => {
      element.style.transform = 'scale(0.95)';
      element.style.opacity = '0.8';
      element.classList.add('transition-all', `duration-${duration}`);
      
      setTimeout(() => {
        element.style.transform = 'scale(1)';
        element.style.opacity = '1';
        element.style.width = `${progress}%`;
      }, 50);
    },
    pulse: () => {
      element.classList.add('animate-pulse', 'bg-opacity-90');
      setTimeout(() => {
        element.classList.remove('animate-pulse', 'bg-opacity-90');
      }, duration);
    }
  };
}
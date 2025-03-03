// Estado da aplicação
let state = {
  timer: {
    mode: 'study', // 'study' ou 'break'
    timeLeft: 25 * 60, // em segundos
    isRunning: false,
    interval: null
  },
  settings: {
    studyTime: 25,
    breakTime: 5,
    cycles: 4
  },
  tasks: [],
  stats: {
    completedCycles: 0,
    totalCycles: 4,
    taskPoints: 0,
    cyclePoints: 0,
    totalPoints: 0
  }
};

// Elementos DOM
const elements = {};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  renderApp();
  initializeElements();
  fetchSettings();
  fetchTasks();
  fetchStats();
  addEventListeners();
});

// Renderizar a aplicação
function renderApp() {
  const appElement = document.getElementById('app');
  appElement.innerHTML = `
    <div id="webcrumbs">
      <div class="h-[800px] bg-gray-900 p-4 md:p-8 font-sans overflow-auto">
        <div class="flex flex-col md:flex-row h-full">
          <div class="w-full md:w-3/4 pr-0 md:pr-6 mb-6 md:mb-0">
            <div class="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] w-full max-w-[600px] mx-auto">
              <div class="absolute inset-0 rounded-full border-8 border-purple-500 shadow-[0_0_15px_#a855f7,0_0_30px_#a855f7] animate-pulse"></div>

              <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-center">
                  <h2 class="text-xl sm:text-2xl md:text-3xl text-white mb-4 md:mb-6">
                    <span class="countdown-label text-purple-300">ESTUDO</span>
                  </h2>
                  <div class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 md:mb-8 font-mono">
                    <span id="timer-display">25:00</span>
                  </div>
                  <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center items-center">
                    <button id="start-button" class="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-[0_0_10px_#a855f7]">
                      <span class="material-symbols-outlined mr-2">play_arrow</span>
                      Iniciar
                    </button>
                    <button id="reset-button" class="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-[0_0_10px_#6b7280]">
                      <span class="material-symbols-outlined mr-2">restart_alt</span>
                      Reiniciar
                    </button>
                  </div>

                  <div class="mt-6 sm:mt-8 md:mt-10 text-purple-300">
                    <p id="cycle-display">Ciclo 1 de 4</p>
                    <div class="w-full bg-gray-700 h-2 mt-2 rounded-full overflow-hidden">
                      <div id="cycle-progress" class="bg-purple-500 h-full w-1/4 shadow-[0_0_10px_#a855f7]"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="absolute inset-0">
                ${Array(12).fill().map((_, i) => `
                  <div
                    class="absolute w-1 h-6 sm:h-8 md:h-10 lg:h-12 bg-purple-400 shadow-[0_0_5px_#a855f7] origin-bottom"
                    style="
                      top: 0;
                      left: 50%;
                      transform: translateX(-50%) rotate(${i * 30}deg);
                      transform-origin: center ${150 + (window.innerWidth < 640 ? 0 : window.innerWidth < 768 ? 50 : window.innerWidth < 1024 ? 100 : 150)}px
                    "
                  ></div>
                `).join('')}
              </div>
            </div>

            <div class="bg-gray-800 rounded-lg p-4 sm:p-6 mt-4 sm:mt-6 md:mt-8 shadow-lg">
              <h3 class="text-lg sm:text-xl text-purple-300 mb-3 sm:mb-4">Configurações</h3>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <label class="block text-gray-300 mb-2">Tempo de Estudo (min)</label>
                  <input
                    id="study-time-input"
                    type="number"
                    class="w-full bg-black text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all relative overflow-hidden shadow-[0_0_15px_rgba(149,76,233,0.5)] animate-pulse"
                    value="25"
                    style="background-image: radial-gradient(circle at 50% 50%, rgba(149, 76, 233, 0.1), transparent 70%)"
                  />
                </div>
                <div>
                  <label class="block text-gray-300 mb-2">Tempo de Intervalo (min)</label>
                  <input
                    id="break-time-input"
                    type="number"
                    class="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all hover:shadow-[0_0_15px_rgba(149,76,233,0.3)]"
                    value="5"
                  />
                </div>
                <div>
                  <label class="block text-gray-300 mb-2">Número de Ciclos</label>
                  <input
                    id="cycles-input"
                    type="number"
                    class="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all hover:shadow-[0_0_15px_rgba(149,76,233,0.3)]"
                    value="4"
                  />
                </div>
              </div>
              <button id="save-settings-button" class="mt-4 w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-[0_0_10px_#a855f7]">
                <span class="material-symbols-outlined mr-2">save</span>
                Salvar Configurações
              </button>
            </div>
          </div>

          <div class="w-full md:w-1/4 bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg h-[400px] md:h-full overflow-y-auto">
            <h2 class="text-xl md:text-2xl text-purple-300 mb-4 md:mb-6 flex items-center">
              <span class="material-symbols-outlined mr-2">task</span>
              Tarefas
            </h2>

            <div class="mb-4">
              <div class="flex gap-2 mb-4">
                <input
                  id="new-task-input"
                  type="text"
                  placeholder="Adicionar nova tarefa..."
                  class="flex-1 bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all hover:shadow-[0_0_10px_rgba(149,76,233,0.3)]"
                />
                <input
                  id="new-task-points"
                  type="number"
                  placeholder="Pontos"
                  class="w-20 bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all hover:shadow-[0_0_10px_rgba(149,76,233,0.3)]"
                />
                <button id="add-task-button" class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-[0_0_10px_#a855f7]">
                  <span class="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>

            <div id="tasks-container" class="space-y-3">
              <!-- Tarefas serão renderizadas aqui -->
            </div>

            <div class="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-700">
              <h3 class="text-lg sm:text-xl text-purple-300 mb-3 sm:mb-4 flex items-center">
                <span class="material-symbols-outlined mr-2">workspace_premium</span>
                Pontuação
              </h3>
              <div class="bg-gray-700 rounded-lg p-3 sm:p-4 hover:shadow-[0_0_10px_rgba(149,76,233,0.2)] transition-all">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                  <div>
                    <div class="text-gray-400 text-sm">Pontos de Tarefas</div>
                    <div id="task-points" class="text-xl sm:text-2xl text-white mt-1">0/0</div>
                  </div>
                  <div class="mt-2 sm:mt-0">
                    <div class="text-gray-400 text-sm">Ciclos Completados</div>
                    <div id="completed-cycles" class="text-xl sm:text-2xl text-white mt-1">0/0</div>
                  </div>
                </div>
                <div class="mt-3 sm:mt-4">
                  <div class="text-gray-400 text-sm">Pontuação Total</div>
                  <div id="total-points" class="text-2xl sm:text-3xl text-purple-300 mt-1 font-bold">0 pontos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Inicializar elementos DOM
function initializeElements() {
  elements.timerDisplay = document.getElementById('timer-display');
  elements.countdownLabel = document.querySelector('.countdown-label');
  elements.startButton = document.getElementById('start-button');
  elements.resetButton = document.getElementById('reset-button');
  elements.cycleDisplay = document.getElementById('cycle-display');
  elements.cycleProgress = document.getElementById('cycle-progress');

  elements.studyTimeInput = document.getElementById('study-time-input');
  elements.breakTimeInput = document.getElementById('break-time-input');
  elements.cyclesInput = document.getElementById('cycles-input');
  elements.saveSettingsButton = document.getElementById('save-settings-button');

  elements.newTaskInput = document.getElementById('new-task-input');
  elements.newTaskPoints = document.getElementById('new-task-points');
  elements.addTaskButton = document.getElementById('add-task-button');
  elements.tasksContainer = document.getElementById('tasks-container');

  elements.taskPoints = document.getElementById('task-points');
  elements.completedCycles = document.getElementById('completed-cycles');
  elements.totalPoints = document.getElementById('total-points');
}

// Adicionar event listeners
function addEventListeners() {
  // Timer controls
  elements.startButton.addEventListener('click', toggleTimer);
  elements.resetButton.addEventListener('click', resetTimer);

  // Settings
  elements.saveSettingsButton.addEventListener('click', saveSettings);

  // Tasks
  elements.addTaskButton.addEventListener('click', addTask);
  elements.newTaskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
  });
}

// Funções de API
async function fetchSettings() {
  try {
    const response = await fetch('/api/settings');
    const settings = await response.json();

    state.settings = settings;
    updateSettingsUI();
    resetTimer();
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
  }
}

async function saveSettings() {
  const studyTime = parseInt(elements.studyTimeInput.value);
  const breakTime = parseInt(elements.breakTimeInput.value);
  const cycles = parseInt(elements.cyclesInput.value);

  if (studyTime <= 0 || breakTime <= 0 || cycles <= 0) {
    alert('Todos os valores devem ser maiores que zero');
    return;
  }

  try {
    const response = await fetch('/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ studyTime, breakTime, cycles })
    });

    const settings = await response.json();
    state.settings = settings;

    // Atualizar o timer se não estiver rodando
    if (!state.timer.isRunning) {
      resetTimer();
    }

    alert('Configurações salvas com sucesso!');
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    alert('Erro ao salvar configurações');
  }
}

async function fetchTasks() {
  try {
    const response = await fetch('/api/tasks');
    const tasks = await response.json();

    state.tasks = tasks;
    renderTasks();
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
  }
}

async function addTask() {
  const title = elements.newTaskInput.value.trim();
  const points = parseInt(elements.newTaskPoints.value);

  if (!title) {
    alert('Digite um título para a tarefa');
    return;
  }

  if (!points || points <= 0) {
    alert('Digite um valor válido para os pontos');
    return;
  }

  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, points })
    });

    const newTask = await response.json();
    state.tasks.push(newTask);

    elements.newTaskInput.value = '';
    elements.newTaskPoints.value = '';

    renderTasks();
    fetchStats();
  } catch (error) {
    console.error('Erro ao adicionar tarefa:', error);
    alert('Erro ao adicionar tarefa');
  }
}

async function toggleTaskCompletion(id, completed) {
  try {
    const task = state.tasks.find(t => t.id === id);

    const response = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ completed: !completed })
    });

    const updatedTask = await response.json();

    // Atualizar a tarefa no estado
    const taskIndex = state.tasks.findIndex(t => t.id === id);
    state.tasks[taskIndex] = updatedTask;

    renderTasks();
    fetchStats();
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    alert('Erro ao atualizar tarefa');
  }
}

async function deleteTask(id) {
  if (!confirm('Tem certeza que deseja excluir esta tarefa?')) {
    return;
  }

  try {
    await fetch(`/api/tasks/${id}`, {
      method: 'DELETE'
    });

    // Remover a tarefa do estado
    state.tasks = state.tasks.filter(task => task.id !== id);

    renderTasks();
    fetchStats();
  } catch (error) {
    console.error('Erro ao excluir tarefa:', error);
    alert('Erro ao excluir tarefa');
  }
}

async function fetchStats() {
  try {
    const response = await fetch('/api/stats');
    const stats = await response.json();

    state.stats = stats;
    updateStatsUI();
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
  }
}

async function completeCycle() {
  try {
    const response = await fetch('/api/cycles/complete', {
      method: 'POST'
    });

    const cycleData = await response.json();
    state.stats.completedCycles = cycleData.completedCycles;
    state.stats.totalCycles = cycleData.totalCycles;

    updateCycleUI();
    fetchStats();
  } catch (error) {
    console.error('Erro ao completar ciclo:', error);
  }
}

async function resetCycles() {
  try {
    const response = await fetch('/api/cycles/reset', {
      method: 'POST'
    });

    const cycleData = await response.json();
    state.stats.completedCycles = cycleData.completedCycles;
    state.stats.totalCycles = cycleData.totalCycles;

    updateCycleUI();
    fetchStats();
  } catch (error) {
    console.error('Erro ao reiniciar ciclos:', error);
  }
}

// Funções de UI
function updateSettingsUI() {
  elements.studyTimeInput.value = state.settings.studyTime;
  elements.breakTimeInput.value = state.settings.breakTime;
  elements.cyclesInput.value = state.settings.cycles;
}

function renderTasks() {
  elements.tasksContainer.innerHTML = '';

  if (state.tasks.length === 0) {
    elements.tasksContainer.innerHTML = `
      <div class="text-gray-400 text-center py-4">
        Nenhuma tarefa adicionada
      </div>
    `;
    return;
  }

  state.tasks.forEach(task => {
    const taskElement = document.createElement('div');
    taskElement.className = 'bg-gray-700 rounded-lg p-3 sm:p-4 hover:bg-gray-650 transition-colors cursor-move group hover:shadow-[0_0_10px_rgba(149,76,233,0.2)]';
    taskElement.innerHTML = `
      <div class="flex justify-between">
        <div class="flex items-start gap-2 sm:gap-3">
          <input
            type="checkbox"
            class="mt-1 h-4 w-4 sm:h-5 sm:w-5 rounded text-purple-500 focus:ring-purple-500 task-checkbox"
            data-id="${task.id}"
            ${task.completed ? 'checked' : ''}
          />
          <span class="text-gray-200 ${task.completed ? 'line-through' : ''} text-sm sm:text-base">
            ${task.title}
          </span>
        </div>
        <span class="material-symbols-outlined text-gray-400 cursor-pointer hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity delete-task" data-id="${task.id}">
          delete
        </span>
      </div>
      <div class="ml-6 sm:ml-8 mt-1 sm:mt-2 text-gray-400 text-xs sm:text-sm">${task.points} pontos</div>
    `;

    elements.tasksContainer.appendChild(taskElement);
  });

  // Adicionar event listeners para os checkboxes e botões de exclusão
  document.querySelectorAll('.task-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const id = e.target.dataset.id;
      const completed = e.target.checked;
      toggleTaskCompletion(id, !completed);
    });
  });

  document.querySelectorAll('.delete-task').forEach(button => {
    button.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      deleteTask(id);
    });
  });
}

function updateStatsUI() {
  const { completedTasks, totalTasks, completedCycles, totalCycles, taskPoints, totalPoints } = state.stats;

  elements.taskPoints.textContent = `${taskPoints}/${totalTasks > 0 ? state.tasks.reduce((sum, task) => sum + task.points, 0) : 0}`;
  elements.completedCycles.textContent = `${completedCycles}/${totalCycles}`;
  elements.totalPoints.textContent = `${totalPoints} pontos`;

  updateCycleUI();
}

function updateCycleUI() {
  const { completedCycles, totalCycles } = state.stats;

  elements.cycleDisplay.textContent = `Ciclo ${completedCycles + 1} de ${totalCycles}`;

  // Atualizar a barra de progresso
  const progressPercentage = (completedCycles / totalCycles) * 100;
  elements.cycleProgress.style.width = `${progressPercentage}%`;
}

// Funções do Timer
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function toggleTimer() {
  if (state.timer.isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function startTimer() {
  state.timer.isRunning = true;
  elements.startButton.innerHTML = '<span class="material-symbols-outlined mr-2">pause</span>Pausar';

  state.timer.interval = setInterval(() => {
    state.timer.timeLeft--;

    if (state.timer.timeLeft <= 0) {
      clearInterval(state.timer.interval);

      // Tocar som de alerta
      const audio = new Audio('/api/alert.mp3');
      audio.play().catch(e => console.log('Erro ao tocar som:', e));

      // Alternar entre estudo e intervalo
      if (state.timer.mode === 'study') {
        // Completar um ciclo de estudo
        if (state.stats.completedCycles < state.settings.cycles - 1) {
          // Mudar para modo de intervalo
          state.timer.mode = 'break';
          state.timer.timeLeft = state.settings.breakTime * 60;
          elements.countdownLabel.textContent = 'INTERVALO';
          elements.countdownLabel.parentElement.classList.remove('text-purple-300');
          elements.countdownLabel.parentElement.classList.add('text-green-300');
        } else {
          // Completar o último ciclo
          completeCycle();
          resetTimer();
          alert('Parabéns! Você completou todos os ciclos de estudo!');
        }
      } else {
        // Completar um intervalo
        completeCycle();

        // Voltar para o modo de estudo
        state.timer.mode = 'study';
        state.timer.timeLeft = state.settings.studyTime * 60;
        elements.countdownLabel.textContent = 'ESTUDO';
        elements.countdownLabel.parentElement.classList.remove('text-green-300');
        elements.countdownLabel.parentElement.classList.add('text-purple-300');
      }

      // Reiniciar o timer
      startTimer();
    }

    elements.timerDisplay.textContent = formatTime(state.timer.timeLeft);
  }, 1000);
}

function pauseTimer() {
  state.timer.isRunning = false;
  clearInterval(state.timer.interval);
  elements.startButton.innerHTML = '<span class="material-symbols-outlined mr-2">play_arrow</span>Iniciar';
}

function resetTimer() {
  pauseTimer();

  state.timer.mode = 'study';
  state.timer.timeLeft = state.settings.studyTime * 60;

  elements.timerDisplay.textContent = formatTime(state.timer.timeLeft);
  elements.countdownLabel.textContent = 'ESTUDO';
  elements.countdownLabel.parentElement.classList.remove('text-green-300');
  elements.countdownLabel.parentElement.classList.add('text-purple-300');

  updateCycleUI();
}
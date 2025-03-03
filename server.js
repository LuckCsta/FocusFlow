const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// Armazenamento em memória (em produção seria um banco de dados)
const db = {
  settings: {
    studyTime: 25,
    breakTime: 5,
    cycles: 4
  },
  tasks: [
    {
      id: uuidv4(),
      title: 'Estudar React Hooks',
      completed: false,
      points: 50
    },
    {
      id: uuidv4(),
      title: 'Completar exercícios de Tailwind',
      completed: false,
      points: 30
    },
    {
      id: uuidv4(),
      title: 'Preparar apresentação',
      completed: true,
      points: 40
    }
  ],
  stats: {
    completedCycles: 1,
    totalPoints: 40
  }
};

// Rotas para configurações
app.get('/api/settings', (req, res) => {
  res.json(db.settings);
});

app.put('/api/settings', (req, res) => {
  const { studyTime, breakTime, cycles } = req.body;
  
  // Validação básica
  if (studyTime <= 0 || breakTime <= 0 || cycles <= 0) {
    return res.status(400).json({ error: 'Todos os valores devem ser maiores que zero' });
  }
  
  db.settings = {
    studyTime: parseInt(studyTime) || db.settings.studyTime,
    breakTime: parseInt(breakTime) || db.settings.breakTime,
    cycles: parseInt(cycles) || db.settings.cycles
  };
  
  res.json(db.settings);
});

// Rotas para tarefas
app.get('/api/tasks', (req, res) => {
  res.json(db.tasks);
});

app.post('/api/tasks', (req, res) => {
  const { title, points } = req.body;
  
  if (!title || !points) {
    return res.status(400).json({ error: 'Título e pontos são obrigatórios' });
  }
  
  const newTask = {
    id: uuidv4(),
    title,
    completed: false,
    points: parseInt(points)
  };
  
  db.tasks.push(newTask);
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { title, completed, points } = req.body;
  
  const taskIndex = db.tasks.findIndex(task => task.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Tarefa não encontrada' });
  }
  
  // Se a tarefa está sendo marcada como concluída e não estava antes
  if (completed && !db.tasks[taskIndex].completed) {
    db.stats.totalPoints += db.tasks[taskIndex].points;
  } 
  // Se a tarefa está sendo desmarcada e estava concluída antes
  else if (!completed && db.tasks[taskIndex].completed) {
    db.stats.totalPoints -= db.tasks[taskIndex].points;
  }
  
  db.tasks[taskIndex] = {
    ...db.tasks[taskIndex],
    title: title || db.tasks[taskIndex].title,
    completed: completed !== undefined ? completed : db.tasks[taskIndex].completed,
    points: points !== undefined ? parseInt(points) : db.tasks[taskIndex].points
  };
  
  res.json(db.tasks[taskIndex]);
});

app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  
  const taskIndex = db.tasks.findIndex(task => task.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Tarefa não encontrada' });
  }
  
  // Se a tarefa estava concluída, subtrair os pontos
  if (db.tasks[taskIndex].completed) {
    db.stats.totalPoints -= db.tasks[taskIndex].points;
  }
  
  db.tasks.splice(taskIndex, 1);
  res.status(204).send();
});

// Rotas para estatísticas
app.get('/api/stats', (req, res) => {
  // Calcular pontuação total de tarefas
  const taskPoints = db.tasks
    .filter(task => task.completed)
    .reduce((sum, task) => sum + task.points, 0);
  
  // Calcular pontuação total (tarefas + ciclos)
  const totalPoints = taskPoints + (db.stats.completedCycles * 50);
  
  const stats = {
    completedTasks: db.tasks.filter(task => task.completed).length,
    totalTasks: db.tasks.length,
    completedCycles: db.stats.completedCycles,
    totalCycles: db.settings.cycles,
    taskPoints,
    cyclePoints: db.stats.completedCycles * 50,
    totalPoints
  };
  
  res.json(stats);
});

// Rota para registrar ciclo completo
app.post('/api/cycles/complete', (req, res) => {
  if (db.stats.completedCycles < db.settings.cycles) {
    db.stats.completedCycles += 1;
  }
  
  res.json({
    completedCycles: db.stats.completedCycles,
    totalCycles: db.settings.cycles
  });
});

// Rota para reiniciar ciclos
app.post('/api/cycles/reset', (req, res) => {
  db.stats.completedCycles = 0;
  
  res.json({
    completedCycles: db.stats.completedCycles,
    totalCycles: db.settings.cycles
  });
});

// Servir arquivos estáticos (para o front-end)
app.use(express.static('public'));

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
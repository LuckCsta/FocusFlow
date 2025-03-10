# Aplicativo de Estudo com Temporizador e Sistema de Tarefas (Python)

Este é um aplicativo de estudo baseado na técnica Pomodoro, que permite configurar tempos de estudo, intervalos e ciclos, além de gerenciar tarefas com um sistema de pontuação.

## Funcionalidades

- **Temporizador Pomodoro**:
  - Configuração de tempo de estudo
  - Configuração de tempo de intervalo
  - Configuração de número de ciclos
  - Alternância automática entre estudo e intervalo

- **Sistema de Tarefas**:
  - Adicionar tarefas com pontuação
  - Marcar tarefas como concluídas
  - Excluir tarefas
  - Visualizar pontuação total

- **Estatísticas**:
  - Acompanhamento de ciclos completados
  - Pontuação por tarefas concluídas
  - Pontuação por ciclos completados
  - Pontuação total

## Tecnologias Utilizadas

- **Backend**: Python, Flask
- **Frontend**: HTML, CSS, JavaScript, Tailwind CSS
- **Armazenamento**: Em memória (pode ser facilmente adaptado para um banco de dados)

## Como Executar

1. Instale as dependências:
   ```
   pip install -r requirements.txt
   ```

2. Inicie o servidor:
   ```
   python app.py
   ```

3. Acesse o aplicativo em seu navegador:
   ```
   http://localhost:3000
   ```

## Estrutura do Projeto

- `app.py` - Servidor Flask e API RESTful
- `static/` - Arquivos estáticos do frontend
  - `index.html` - Estrutura HTML
  - `app.js` - Lógica do frontend
  - `styles.css` - Estilos CSS

## API Endpoints

### Configurações
- `GET /api/settings` - Obter configurações atuais
- `PUT /api/settings` - Atualizar configurações

### Tarefas
- `GET /api/tasks` - Listar todas as tarefas
- `POST /api/tasks` - Adicionar nova tarefa
- `PUT /api/tasks/:id` - Atualizar tarefa existente
- `DELETE /api/tasks/:id` - Excluir tarefa

### Estatísticas
- `GET /api/stats` - Obter estatísticas atuais
- `POST /api/cycles/complete` - Registrar ciclo completo
- `POST /api/cycles/reset` - Reiniciar contagem de ciclos
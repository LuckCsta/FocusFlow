from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import uuid
import json
import os

app = Flask(__name__, static_folder='static')
CORS(app)

# Armazenamento em memória (em produção seria um banco de dados)
db = {
    "settings": {
        "studyTime": 25,
        "breakTime": 5,
        "cycles": 4
    },
    "tasks": [
        {
            "id": str(uuid.uuid4()),
            "title": "Estudar React Hooks",
            "completed": False,
            "points": 50
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Completar exercícios de Tailwind",
            "completed": False,
            "points": 30
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Preparar apresentação",
            "completed": True,
            "points": 40
        }
    ],
    "stats": {
        "completedCycles": 1,
        "totalPoints": 40
    }
}


# Rotas para servir arquivos estáticos
@app.route('/')
def index():
    return send_from_directory('static', 'index.html')


@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('static', path)


# Rotas para configurações
@app.route('/api/settings', methods=['GET'])
def get_settings():
    return jsonify(db["settings"])


@app.route('/api/settings', methods=['PUT'])
def update_settings():
    data = request.json

    # Validação básica
    if data.get('studyTime', 0) <= 0 or data.get('breakTime', 0) <= 0 or data.get('cycles', 0) <= 0:
        return jsonify({"error": "Todos os valores devem ser maiores que zero"}), 400

    db["settings"] = {
        "studyTime": int(data.get('studyTime', db["settings"]["studyTime"])),
        "breakTime": int(data.get('breakTime', db["settings"]["breakTime"])),
        "cycles": int(data.get('cycles', db["settings"]["cycles"]))
    }

    return jsonify(db["settings"])


# Rotas para tarefas
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    return jsonify(db["tasks"])


@app.route('/api/tasks', methods=['POST'])
def add_task():
    data = request.json

    if not data.get('title') or not data.get('points'):
        return jsonify({"error": "Título e pontos são obrigatórios"}), 400

    new_task = {
        "id": str(uuid.uuid4()),
        "title": data.get('title'),
        "completed": False,
        "points": int(data.get('points'))
    }

    db["tasks"].append(new_task)
    return jsonify(new_task), 201


@app.route('/api/tasks/<task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.json

    task_index = next((i for i, task in enumerate(db["tasks"]) if task["id"] == task_id), None)

    if task_index is None:
        return jsonify({"error": "Tarefa não encontrada"}), 404

    # Se a tarefa está sendo marcada como concluída e não estava antes
    if data.get('completed') and not db["tasks"][task_index]["completed"]:
        db["stats"]["totalPoints"] += db["tasks"][task_index]["points"]
    # Se a tarefa está sendo desmarcada e estava concluída antes
    elif data.get('completed') is False and db["tasks"][task_index]["completed"]:
        db["stats"]["totalPoints"] -= db["tasks"][task_index]["points"]

    # Atualizar a tarefa
    if 'title' in data:
        db["tasks"][task_index]["title"] = data["title"]
    if 'completed' in data:
        db["tasks"][task_index]["completed"] = data["completed"]
    if 'points' in data:
        db["tasks"][task_index]["points"] = int(data["points"])

    return jsonify(db["tasks"][task_index])


@app.route('/api/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    task_index = next((i for i, task in enumerate(db["tasks"]) if task["id"] == task_id), None)

    if task_index is None:
        return jsonify({"error": "Tarefa não encontrada"}), 404

    # Se a tarefa estava concluída, subtrair os pontos
    if db["tasks"][task_index]["completed"]:
        db["stats"]["totalPoints"] -= db["tasks"][task_index]["points"]

    # Remover a tarefa
    db["tasks"].pop(task_index)
    return "", 204


# Rotas para estatísticas
@app.route('/api/stats', methods=['GET'])
def get_stats():
    # Calcular pontuação total de tarefas
    task_points = sum(task["points"] for task in db["tasks"] if task["completed"])

    # Calcular pontuação total (tarefas + ciclos)
    total_points = task_points + (db["stats"]["completedCycles"] * 50)

    stats = {
        "completedTasks": len([task for task in db["tasks"] if task["completed"]]),
        "totalTasks": len(db["tasks"]),
        "completedCycles": db["stats"]["completedCycles"],
        "totalCycles": db["settings"]["cycles"],
        "taskPoints": task_points,
        "cyclePoints": db["stats"]["completedCycles"] * 50,
        "totalPoints": total_points
    }

    return jsonify(stats)


@app.route('/api/cycles/complete', methods=['POST'])
def complete_cycle():
    if db["stats"]["completedCycles"] < db["settings"]["cycles"]:
        db["stats"]["completedCycles"] += 1

    return jsonify({
        "completedCycles": db["stats"]["completedCycles"],
        "totalCycles": db["settings"]["cycles"]
    })


@app.route('/api/cycles/reset', methods=['POST'])
def reset_cycles():
    db["stats"]["completedCycles"] = 0

    return jsonify({
        "completedCycles": db["stats"]["completedCycles"],
        "totalCycles": db["settings"]["cycles"]
    })


# Rota para o arquivo de alerta
@app.route('/api/alert.mp3')
def get_alert():
    return send_from_directory('static', 'alert.mp3')


if __name__ == '__main__':
    # Garantir que a pasta static existe
    if not os.path.exists('static'):
        os.makedirs('static')

    app.run(debug=True, port=3000)
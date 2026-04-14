from flask import Flask, request, jsonify
from flask_cors import CORS
from tinydb import TinyDB, Query
import bcrypt

app = Flask(__name__)
CORS(app)

db = TinyDB('users.json')
users_table = db.table('users')
User = Query()

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    email = data.get('email', '').strip()

    if not username or not password or not email:
        return jsonify({'error': 'Tutti i campi sono obbligatori'}), 400
    if users_table.search(User.username == username):
        return jsonify({'error': 'Username già esistente'}), 409
    if users_table.search(User.email == email):
        return jsonify({'error': 'Email già registrata'}), 409

    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    users_table.insert({'username': username, 'email': email, 'password': hashed})
    return jsonify({'message': 'Registrazione completata con successo'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if not username or not password:
        return jsonify({'error': 'Username e password obbligatori'}), 400

    result = users_table.search(User.username == username)
    if not result:
        return jsonify({'error': 'Credenziali non valide'}), 401

    user = result[0]
    if not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        return jsonify({'error': 'Credenziali non valide'}), 401

    return jsonify({'message': f'Benvenuto, {username}!', 'username': username}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)

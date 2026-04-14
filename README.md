# DualHub — App React + TinyDB
# App con registrazione e login usando React (Vite) per il frontend e Flask + TinyDB per il backend.

# Struttura del progetto
# DualHub_/
├── backend/
│   ├── app.py              ← Server Flask + TinyDB
│   ├── requirements.txt    ← Dipendenze Python
│   └── users.json          ← Database TinyDB (creato automaticamente)
│
├── src/
│   ├── App.jsx
│   ├── App.css
│   └── components/
│       ├── Login.jsx
│       ├── Register.jsx
│       └── Dashboard.jsx
│
├── index.html
├── package.json
└── vite.config.js

# Setup in GitHub Codespace
# 1. Crea l'app React con Vite
bashnpm create vite@latest . -- --template react
npm install
# 2. Copia i file del progetto
Copia i file da questo repository nella struttura indicata sopra.
# 3. Installa il backend Python
# Apri un secondo terminale nel Codespace:
bashcd backend
pip install -r requirements.txt
python app.py
# Il backend parte su http://localhost:5000
# 4. Avvia il frontend
#Nel primo terminale:
bashnpm run dev
Il frontend parte su http://localhost:5173

Come funziona

Registrazione: inserisci username, email e password → i dati vengono salvati in backend/users.json con password hashata (bcrypt)
Login: inserisci username e password → il server verifica le credenziali
Dashboard: dopo il login viene mostrata una pagina di benvenuto con il tuo username


API Backend
MetodoEndpointBodyDescrizionePOST/api/register{username, email, password}Registra un nuovo utentePOST/api/login{username, password}Autentica un utente

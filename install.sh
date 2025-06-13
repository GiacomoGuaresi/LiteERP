#!/bin/bash

# Variabili
FRONTEND_DIR="/opt/myapp/Frontend"
BACKEND_DIR="/opt/myapp/Backend"
USER="www-data"  # o un utente esistente col quale vuoi far girare i servizi

echo "📦 Installazione dipendenze di sistema..."
sudo apt update
sudo apt install -y nodejs npm python3 python3-venv python3-pip

echo "📁 Creazione cartelle e copia codice..."
sudo mkdir -p /opt/myapp
sudo cp -r ./Frontend /opt/myapp/
sudo cp -r ./Backend /opt/myapp/
sudo chown -R $USER:$USER /opt/myapp

echo "⬇️ Installazione dipendenze Frontend..."
cd $FRONTEND_DIR
sudo -u $USER npm install

echo "🐍 Creazione virtualenv e installazione Backend..."
cd $BACKEND_DIR
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate

echo "🛠️ Creazione servizi systemd..."

# FRONTEND
sudo tee /etc/systemd/system/myapp-frontend.service > /dev/null <<EOF
[Unit]
Description=MyApp Frontend
After=network.target

[Service]
WorkingDirectory=$FRONTEND_DIR
ExecStart=/usr/bin/npm start
Restart=always
User=$USER
Environment=NODE_ENV=production
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=myapp-frontend

[Install]
WantedBy=multi-user.target
EOF

# BACKEND
sudo tee /etc/systemd/system/myapp-backend.service > /dev/null <<EOF
[Unit]
Description=MyApp Backend
After=network.target

[Service]
WorkingDirectory=$BACKEND_DIR
ExecStart=$BACKEND_DIR/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
User=$USER
Environment=PYTHONUNBUFFERED=1
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=myapp-backend

[Install]
WantedBy=multi-user.target
EOF

echo "🚀 Abilitazione e avvio dei servizi..."
sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl enable myapp-frontend.service
sudo systemctl enable myapp-backend.service
sudo systemctl start myapp-frontend.service
sudo systemctl start myapp-backend.service

echo "✅ Installazione completata! Puoi controllare lo stato con:"
echo "  sudo systemctl status myapp-frontend"
echo "  sudo systemctl status myapp-backend"

echo "📦 Installazione dipendenze di sistema..."
sudo apt update
sudo apt install -y nodejs npm python3 python3-venv python3-pip

echo "⬇️ Installazione dipendenze Frontend..."
cd ./Frontend
echo "REACT_APP_API_URL=http://liteerp.local:8000" > .env
sudo npm install
sudo npm run build
cd ..

echo "🐍 Creazione virtualenv e installazione Backend..."
cd ./Backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate
cd ..

echo "🛠️ Creazione servizi systemd..."
CURRENT_DIR=$(pwd)

# FRONTEND
sudo tee /etc/systemd/system/liteERP-frontend.service > /dev/null <<EOF
[Unit]
Description=liteERP Frontend
After=network.target

[Service]
WorkingDirectory=$CURRENT_DIR/Frontend
ExecStart=/usr/bin/npm start
Restart=always
Environment=NODE_ENV=production
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=liteERP-frontend

[Install]
WantedBy=multi-user.target
EOF

# BACKEND
sudo tee /etc/systemd/system/liteERP-backend.service > /dev/null <<EOF
[Unit]
Description=liteERP Backend
After=network.target

[Service]
WorkingDirectory=$CURRENT_DIR/Backend
ExecStart=$CURRENT_DIR/Backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
Environment=PYTHONUNBUFFERED=1
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=liteERP-backend

[Install]
WantedBy=multi-user.target
EOF

echo "🚀 Abilitazione e avvio dei servizi..."
sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl enable liteERP-frontend.service
sudo systemctl enable liteERP-backend.service
sudo systemctl start liteERP-frontend.service
sudo systemctl start liteERP-backend.service

echo "🛠️  Configurazione dell'hostname e di Avahi per liteerp.local..."

# Imposta l'hostname
sudo hostnamectl set-hostname liteerp

# Modifica /etc/hosts
sudo sed -i 's/127.0.1.1.*/127.0.1.1\tliteerp/' /etc/hosts

# Riavvia Avahi se è installato, altrimenti installalo
if systemctl is-active --quiet avahi-daemon; then
  echo "🔁 Riavvio di avahi-daemon..."
  sudo systemctl restart avahi-daemon
else
  echo "📦 Avahi non trovato, lo installo..."
  sudo apt update
  sudo apt install -y avahi-daemon
  sudo systemctl enable avahi-daemon
  sudo systemctl start avahi-daemon
fi

echo "🌐 Ora puoi raggiungere questa macchina con: http://liteerp.local"
echo "✅ Installazione completata! Puoi controllare lo stato con:"
echo "  sudo systemctl status liteERP-frontend"
echo "  sudo systemctl status liteERP-backend"

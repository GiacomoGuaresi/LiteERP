#!/bin/bash

echo "Starting Frontend and Backend..."

# Avvia il Frontend in background
(cd Frontend && npm start) &

# Avvia il Backend in background
(cd Backend && python -m uvicorn main:app --reload --host 127.0.0.1) &

# Attendi che entrambi i processi terminino (opzionale)
wait

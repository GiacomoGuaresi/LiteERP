@echo off
echo Avvio dei servizi Frontend e Backend...

REM Avvia il Frontend in una nuova finestra
start "Frontend" cmd /k "cd Frontend && npm start"

REM Avvia il Backend in una nuova finestra
start "Backend" cmd /k "cd Backend && python -m uvicorn main:app --reload --host 127.0.0.1"

echo Tutti i servizi sono stati avviati.

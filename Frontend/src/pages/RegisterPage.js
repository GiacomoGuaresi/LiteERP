import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api/user';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Pulisce errori precedenti

    if (password !== confirmPassword) {
      setError('Le password non corrispondono.');
      return;
    }

    try {
      // Invia tutti i campi richiesti dallo schema del tuo User
      const response = await register({
        email,
        password,
        name,
        surname,
        pin,
      });
      console.log('Registrazione avvenuta con successo:', response.data);
      navigate('/login'); // Reindirizza alla pagina di login dopo la registrazione
    } catch (err) {
      console.error('Errore di registrazione:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.detail || 'Registrazione fallita. Riprova.');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
      }}
    >
      <Paper elevation={3} sx={{ padding: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Registrati
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Nome"
            type="text"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            label="Cognome"
            type="text"
            fullWidth
            margin="normal"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            required
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="PIN (numerico)"
            type="text" // Puoi usare "number" per la tastiera numerica, ma "text" per permettere validazione personalizzata
            fullWidth
            margin="normal"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            inputProps={{ maxLength: 5 }} // Ad esempio, se il PIN è di 5 cifre
            required
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <TextField
            label="Conferma Password"
            type="password"
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3, mb: 2 }}
          >
            Registrati
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default RegisterPage;
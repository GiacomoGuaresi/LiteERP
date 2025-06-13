// src/pages/UsersPage.js
import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Card, CardContent, CardActions, IconButton, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, TextField, Box, Avatar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import { getUsers, register, updateUser, deleteUser } from '../api/user';

// Utility per le iniziali
const getUserInitials = (name, surname) => {
  const n = name?.[0]?.toUpperCase() || '';
  const s = surname?.[0]?.toUpperCase() || '';
  return n + s;
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error('Errore caricamento utenti', err);
    }
  };

  const openNewUserDialog = () => {
    setEditUser(null);
    setFormData({ name: '', surname: '', email: '', password: '', confirmPassword: ''});
    setDialogOpen(true);
  };

  const openEditUserDialog = (user) => {
    setEditUser(user);
    setFormData({
      name: user.name || '',
      surname: user.surname || '',
      email: user.email || '',
      password: '',
      confirmPassword: '',
    });
    setDialogOpen(true);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validatePassword = (pwd) => {
    // almeno 8 caratteri, una lettera maiuscola, una minuscola, un numero
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pwd);
  };

  const handleSaveUser = async () => {
    try {
      if (!formData.name || !formData.email || !formData.surname) {
        alert("Name, Surname e Email sono obbligatori.");
        return;
      }

      if (!editUser) {
        // creazione utente
        if (!formData.password || !formData.confirmPassword) {
          alert("La password è obbligatoria.");
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          alert("Le password non coincidono.");
          return;
        }
        if (!validatePassword(formData.password)) {
          alert("La password deve contenere almeno 8 caratteri, una maiuscola, una minuscola e un numero.");
          return;
        }
        await register(formData);
      } else {
        // aggiornamento
        const updateData = {
          name: formData.name,
          surname: formData.surname,
          email: formData.email,
        };
        if (formData.password) {
          if (formData.password !== formData.confirmPassword) {
            alert("Le password non coincidono.");
            return;
          }
          if (!validatePassword(formData.password)) {
            alert("La password deve contenere almeno 8 caratteri, una maiuscola, una minuscola e un numero.");
            return;
          }
          updateData.password = formData.password;
        }
        await updateUser(editUser.ID, updateData);
      }

      setDialogOpen(false);
      loadUsers();
    } catch (err) {
      console.error('Errore salvataggio utente', err);
      alert('Errore durante il salvataggio');
    }
  };

  const confirmDelete = (id) => {
    setUserToDelete(id);
    setConfirmOpen(true);
  };

  const performDelete = async () => {
    try {
      if (userToDelete) {
        await deleteUser(userToDelete);
        setUserToDelete(null);
        setConfirmOpen(false);
        loadUsers();
      }
    } catch (err) {
      console.error('Errore cancellazione utente', err);
      alert('Errore durante la cancellazione');
    }
  };

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} mb={3}>
        <Typography variant="h4">Users Management</Typography>
        <Button startIcon={<AddIcon />} variant="contained" onClick={openNewUserDialog}>
          New User
        </Button>
      </Box>

      <Grid container spacing={2}>
        {users.map(user => (
          <Grid item xs={12} sm={6} md={4} key={user.ID}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    width: 35,
                    height: 35,
                    fontSize: '0.9rem',
                    marginRight: 2,
                  }}
                >
                  {getUserInitials(user.name, user.surname)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{user.name} {user.surname}</Typography>
                  <Typography>Email: {user.email}</Typography>
                </Box>
              </CardContent>
              <CardActions>
                <IconButton onClick={() => openEditUserDialog(user)}><EditIcon /></IconButton>
                <IconButton onClick={() => confirmDelete(user.ID)}><DeleteIcon color="error" /></IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog creazione/modifica */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{editUser ? 'Edit User' : 'New User'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => handleFormChange('name', e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Surname"
            value={formData.surname}
            onChange={(e) => handleFormChange('surname', e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleFormChange('email', e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label={editUser ? "New Password" : "Password"}
            type="password"
            value={formData.password}
            onChange={(e) => handleFormChange('password', e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleFormChange('confirmPassword', e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveUser}>{editUser ? 'Save' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      {/* Conferma cancellazione */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>Are you sure you want to delete this user?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={performDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UsersPage;

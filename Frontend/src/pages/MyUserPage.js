import React, { useState, useEffect, useContext } from 'react';
import { TextField, Button, Box, Typography, Container, CircularProgress, Alert } from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';
import { updateUser } from '../api/user';

function MyUserPage() {
    const { user, isLoading, login: authLogin } = useContext(AuthContext);

    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);


    useEffect(() => {
        if (user) {
            setEmail(user.email || '');
            setName(user.name || '');
            setSurname(user.surname || '');
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        if (newPassword && newPassword !== confirmNewPassword) {
            setError('Le nuove password non corrispondono.');
            setIsSubmitting(false);
            return;
        }

        const updatedUserData = {
            email,
            name,
            surname,
        };


        if (newPassword) {
            updatedUserData.password = newPassword;
        }

        try {
            const response = await updateUser(user.ID, updatedUserData);
            authLogin(response.data, localStorage.getItem('accessToken'));
            setSuccess('Profilo aggiornato con successo!');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err) {
            console.error('Errore durante l\'aggiornamento del profilo:', err.response ? err.response.data : err.message);
            setError(err.response?.data?.detail || 'Errore durante l\'aggiornamento del profilo.');
        } finally {
            setIsSubmitting(false);
        }
    };


    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }


    if (!user) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <Typography variant="h6" color="textSecondary">
                    Nessun utente loggato. Effettua il login per visualizzare il tuo profilo.
                </Typography>
            </Box>
        );
    }

    return (
        <Container>
            <Typography variant="h4" mt={2}>
                My Profile
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Name"
                    type="text"
                    fullWidth
                    margin="normal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Surname"
                    type="text"
                    fullWidth
                    margin="normal"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    required
                    sx={{ mb: 2 }}
                />
                <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                    Change Password (Leave blank if not changing)
                </Typography>
                <TextField
                    label="New Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Confirm New Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    sx={{ mb: 3 }}
                />

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2, mb: 2 }}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
            </form>
        </Container>
    );
}

export default MyUserPage;
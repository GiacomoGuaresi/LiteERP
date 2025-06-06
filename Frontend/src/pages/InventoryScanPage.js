import React, { useEffect, useRef, useState } from 'react';
import {
    Container, Typography, TextField, Button, Box, Table, TableHead, TableRow,
    TableCell, TableBody, Paper, LinearProgress
} from '@mui/material';
import { addToInventoryByCode } from '../api/inventory';

const SYNC_DELAY = 10; // in seconds

const InventoryScanPage = () => {
    const [scannedItems, setScannedItems] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);
    const inputRef = useRef(null);
    const lastScannedRef = useRef(null);
    const timeoutRef = useRef(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        focusInput();

        const handleBeforeUnload = (e) => {
            if (scannedItems.length > 0) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            clearTimeout(timeoutRef.current);
            clearInterval(intervalRef.current);
        };
    }, [scannedItems]);

    const focusInput = () => {
        if (inputRef.current) inputRef.current.focus();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const code = inputValue.trim();
        if (!code) return;

        lastScannedRef.current = code;

        setScannedItems(prev => {
            const existing = prev.find(item => item.code === code);
            if (existing) {
                return prev.map(item =>
                    item.code === code ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prev, { code, quantity: 1 }];
            }
        });

        setInputValue('');
        focusInput();
        restartCountdown();
    };

    const processInventory = () => {
        if (scannedItems.length === 0) return;

        scannedItems.forEach(({ code, quantity }) => {
            addToInventoryByCode(code, quantity)
                .then(() => console.log(`Aggiunto ${quantity} di ${code}`))
                .catch((err) => console.error(`Errore su ${code}:`, err));
        });

        setScannedItems([]);
        lastScannedRef.current = null;
        setTimeLeft(0);
    };

    const handleCancelLast = () => {
        const lastCode = lastScannedRef.current;
        if (!lastCode) return;

        setScannedItems(prev => {
            return prev
                .map(item =>
                    item.code === lastCode
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                )
                .filter(item => item.quantity > 0);
        });

        lastScannedRef.current = null;
        focusInput();
    };

    useEffect(() => {
        if (timeLeft === 0) {
            if (scannedItems.length > 0) {
                processInventory();
            }
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft]);

    const restartCountdown = () => {
        setTimeLeft(SYNC_DELAY);
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Typography variant="h4" align="center" gutterBottom>
                Scan Inventory
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                    inputRef={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    label="Scan Code"
                    variant="outlined"
                    fullWidth
                    autoFocus
                />
                <Button variant="outlined" color="error" onClick={handleCancelLast}>
                    Cancel
                </Button>
            </Box>

            {timeLeft > 0 && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" gutterBottom>
                        Syncing in {timeLeft}s...
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={((SYNC_DELAY - timeLeft) / SYNC_DELAY) * 100}
                    />
                </Box>
            )}

            {scannedItems.length > 0 && (
                <Paper elevation={3}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Code</TableCell>
                                <TableCell align="right">Quantity</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {scannedItems.map(item => (
                                <TableRow key={item.code}>
                                    <TableCell>{item.code}</TableCell>
                                    <TableCell align="right">{item.quantity}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            )}
        </Container>
    );
};

export default InventoryScanPage;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInventoryItem, updateInventoryItem } from '../api/inventory';
import {
    Container, TextField, Button, Typography, Box,
    FormControl, InputLabel, Select, MenuItem
} from '@mui/material';

const InventoryEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState({
        code: '',
        quantity_on_hand: 0,
        quantity_locked: 0,
        category: '',
        datas: '{}',
        image: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchItem = async () => {
            const res = await getInventoryItem(id);
            setItem({
                ...res.data,
                datas: JSON.stringify(res.data.datas, null, 2) // stringify for editable textarea
            });
        };
        fetchItem();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setItem(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setItem(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            //   const parsedDatas = JSON.parse(item.datas);
            //   await updateInventoryItem(id, { ...item, datas: parsedDatas });
            await updateInventoryItem(id, item);
            navigate('/inventory');
        } catch (err) {
            setError('Datas must be a valid JSON string');
        }
    };

    return (
        <Container>
            <Typography variant="h4" mt={2}>Edit Inventory Item</Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <TextField label="Code" name="code" value={item.code} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
                <TextField label="Quantity on Hand" name="quantity_on_hand" type="number" value={item.quantity_on_hand} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
                <TextField label="Quantity Locked" name="quantity_locked" type="number" value={item.quantity_locked} onChange={handleChange} fullWidth sx={{ mb: 2 }} />

                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Category</InputLabel>
                    <Select name="category" value={item.category} onChange={handleChange} label="Category" required>
                        <MenuItem value="Product">Product</MenuItem>
                        <MenuItem value="Component">Component</MenuItem>
                        <MenuItem value="Printed part">Printed part</MenuItem>
                        <MenuItem value="Subassembly">Subassembly</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    label="Datas (JSON)"
                    name="datas"
                    value={item.datas}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    minRows={3}
                    sx={{ mb: 2 }}
                    error={!!error}
                    helperText={error}
                />

                <Button variant="contained" component="label" sx={{ mb: 2 }}>
                    Upload Image
                    <input type="file" hidden onChange={handleImageChange} accept="image/*" />
                </Button>

                {item.image && (
                    <Box sx={{ mb: 2 }}>
                        <img src={item.image} alt="Preview" style={{ maxWidth: '200px' }} />
                    </Box>
                )}

                <Button variant="contained" type="submit">Save</Button>
            </Box>
        </Container>
    );
};

export default InventoryEditPage;

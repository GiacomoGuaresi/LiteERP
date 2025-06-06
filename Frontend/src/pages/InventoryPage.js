// src/pages/InventoryPage.js
import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Card, CardContent, CardActions, IconButton, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, TextField, Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ViewIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SearchIcon from '@mui/icons-material/Search';
import BarcodeReaderIcon from '@mui/icons-material/BarcodeReader';
import { CircularProgress } from '@mui/material';

import { getInventory, deleteInventoryItem, addToInventory, removeFromInventory } from '../api/inventory';

const InventoryPage = () => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(false);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await getInventory();
      setItems(res.data);
      const initialQuantities = {};
      res.data.forEach(item => {
        initialQuantities[item.ID] = 1;
      });
      setQuantities(initialQuantities);
    } catch (err) {
      console.error('Error loading inventory:', err);
    } finally {
      setLoading(false);
    }
  };


  const confirmDelete = (id) => {
    setItemToDelete(id);
    setConfirmOpen(true);
  };

  const performDelete = async () => {
    if (itemToDelete) {
      await deleteInventoryItem(itemToDelete);
      setConfirmOpen(false);
      setItemToDelete(null);
      loadInventory();
    }
  };

  const handleEdit = (id) => window.location.href = `/inventory/edit/${id}`;
  const handleView = (id) => window.location.href = `/inventory/view/${id}`;


  const handleQuantityChange = (id, value) => {
    const intVal = parseInt(value, 10);
    setQuantities(prev => ({
      ...prev,
      [id]: isNaN(intVal) || intVal < 1 ? 1 : intVal
    }));
  };

  const handleAddToInventory = (id) => {
    const quantity = quantities[id] || 1;
    addToInventory(id, quantity)
      .then(() => {
        console.log(`AGGIUNGI ${quantity} al prodotto con ID ${id}`);
        loadInventory();
      })
      .catch(err => {
        console.error('Error adding to inventory:', err);
      });
  };

  const handleRemoveFromInventory = (id) => {
    const quantity = quantities[id] || 1;
    removeFromInventory(id, quantity)
      .then(() => {
        console.log(`RIMUOVI ${quantity} dal prodotto con ID ${id}`);
        loadInventory();
      })
      .catch(err => {
        console.error('Error removing from inventory:', err);
      });
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const filteredItems = items.filter(item =>
    item.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} mb={2}>
        <Typography variant="h4">Inventory</Typography>
        <div>
          <Button
            startIcon={<BarcodeReaderIcon />}
            variant="contained"
            onClick={() => window.location.href = '/inventory/scanner'}
            sx={{ mx: 1 }}
          >
            Scanner Page
          </Button>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => window.location.href = '/inventory/create'}
          >
            New Item
          </Button>
        </div>
      </Box>
      <TextField
        label="Search by Code"
        variant="outlined"
        fullWidth
        sx={{ mb: 3 }}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          endAdornment: <SearchIcon />
        }}
      />
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2} sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          {filteredItems.map(item => (
            <Grid item xs={12} sm={6} md={4} key={item.ID}>
              <Card>
                {item.image && (
                  <Box
                    component="img"
                    src={`${item.image}`}
                    alt={item.code}
                    sx={{ width: '100%', height: 180, objectFit: 'cover' }}
                  />
                )}
                <CardContent>
                  <Typography variant="h6">{item.code}</Typography>
                  <Typography>Quantity: {item.quantity_on_hand}</Typography>
                  <Typography>Locked: {item.quantity_locked}</Typography>
                  <Typography>Category: {item.category}</Typography>
                </CardContent>
                <CardActions sx={{ flexDirection: 'column', alignItems: 'stretch', gap: 1, p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<RemoveIcon />}
                      onClick={() => handleRemoveFromInventory(item.ID)}
                    />
                    <TextField
                      type="number"
                      value={quantities[item.ID] || 1}
                      onChange={(e) => handleQuantityChange(item.ID, e.target.value)}
                      inputProps={{ min: 1 }}
                      sx={{ width: 60 }}
                    />
                    <Button
                      variant="outlined"
                      color="success"
                      startIcon={<AddIcon />}
                      onClick={() => handleAddToInventory(item.ID)}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <IconButton onClick={() => handleView(item.ID)}><ViewIcon /></IconButton>
                    <IconButton onClick={() => handleEdit(item.ID)}><EditIcon /></IconButton>
                    <IconButton onClick={() => confirmDelete(item.ID)}><DeleteIcon /></IconButton>
                  </Box>
                </CardActions>

              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>Are you sure you want to delete this item?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={performDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InventoryPage;

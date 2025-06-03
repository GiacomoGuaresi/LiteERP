// src/pages/ProductionOrdersPage.js
import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Card, CardContent, CardActions, IconButton, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, TextField, MenuItem, Box
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { getProductionOrders, createProductionOrderItem, deleteProductionOrderItem } from '../api/productionOrder';
import { getInventoryIDsAndCodes } from '../api/inventory';
import { useNavigate } from 'react-router-dom';

const ProductionOrdersPage = () => {
  const todayDate = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD
  const [orders, setOrders] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [inventoryMap, setInventoryMap] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    date: todayDate,
    productID: '',
    quantityRequested: 1,
    status: '',
    userIDs: '',
    notes: ''
  });
  const [itemToDelete, setItemToDelete] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [orderRes, inventoryRes] = await Promise.all([
      getProductionOrders(),
      getInventoryIDsAndCodes()
    ]);

    const invMap = {};
    inventoryRes.data.forEach(item => {
      invMap[item.ID] = item.code;
    });

    setOrders(orderRes.data);
    setInventoryItems(inventoryRes.data);
    setInventoryMap(invMap);
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCreateOrder = async () => {
    await createProductionOrderItem({
      ...newOrder,
      productID: parseInt(newOrder.productID),
      quantityRequested: parseInt(newOrder.quantityRequested),
      quantityProduced: 0, // sempre 0
      parentProductionOrderDetailsID: null // sempre null
    });
    setDialogOpen(false);
    setNewOrder({
      date: todayDate,
      productID: '',
      quantityRequested: 1,
      status: '',
      userIDs: '',
      notes: ''
    });
    loadData();
  };


  const confirmDelete = (id) => {
    setItemToDelete(id);
    setConfirmOpen(true);
  };

  const performDelete = async () => {
    if (itemToDelete) {
      await deleteProductionOrderItem(itemToDelete);
      setItemToDelete(null);
      setConfirmOpen(false);
      loadData();
    }
  };

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} mb={3}>
        <Typography variant="h4">Production Orders</Typography>
        <Button startIcon={<AddIcon />} variant="contained" onClick={handleOpenDialog}>
          New Order
        </Button>
      </Box>

      <Grid container spacing={2}>
        {orders.map(order => (
          <Grid item xs={12} sm={6} md={4} key={order.ID}>
            <Card>
              <CardContent>
                <Typography variant="h6">{inventoryMap[order.productID] || `ID ${order.productID}`}</Typography>
                <Typography>{order.date}</Typography>
                <Typography>{order.status}</Typography>
                <Typography>{order.quantityProduced} / {order.quantityRequested}</Typography>
              </CardContent>
              <CardActions>
                <IconButton onClick={() => navigate(`/productionOrder/${order.ID}`)}>
                  <VisibilityIcon />
                </IconButton>
                {order.status !== 'Completed' && (
                  <IconButton onClick={() => confirmDelete(order.ID)}>
                    <DeleteIcon color="error" />
                  </IconButton>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog nuovo ordine */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Create Production Order</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={newOrder.date}
            onChange={(e) => setNewOrder({ ...newOrder, date: e.target.value })}
            sx={{ mt: 2 }}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: todayDate }}
          />
          <TextField
            select
            fullWidth
            label="Product"
            value={newOrder.productID}
            onChange={(e) => setNewOrder({ ...newOrder, productID: e.target.value })}
            sx={{ mt: 2 }}
          >
            {inventoryItems.map(item => (
              <MenuItem key={item.ID} value={item.ID}>
                {item.code}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Quantity Requested"
            type="number"
            fullWidth
            value={newOrder.quantityRequested}
            onChange={(e) => setNewOrder({ ...newOrder, quantityRequested: e.target.value })}
            sx={{ mt: 2 }}
            inputProps={{ min: 1 }}
          />
          <TextField
            select
            fullWidth
            label="Status"
            value={newOrder.status}
            onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}
            sx={{ mt: 2 }}
          >
            <MenuItem value="Planned">Planned</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
          </TextField>
          <TextField
            label="User IDs (comma separated)"
            fullWidth
            value={newOrder.userIDs}
            onChange={(e) => setNewOrder({ ...newOrder, userIDs: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Notes"
            fullWidth
            multiline
            minRows={3}
            value={newOrder.notes}
            onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateOrder}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Conferma cancellazione */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>Are you sure you want to delete this order?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={performDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductionOrdersPage;

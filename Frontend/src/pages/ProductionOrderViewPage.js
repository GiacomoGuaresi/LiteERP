// src/pages/ProductionOrderView.js
import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Card, CardContent, CardActions, IconButton,
  Button, TextField, Grid, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';

import { useParams } from 'react-router-dom';
import {
  getProductionOrder, updateProductionOrderStatusItem
} from '../api/productionOrder';
import {
  getProductionOrderDetails, createProductionOrderDetail,
  updateProductionOrderDetail, deleteProductionOrderDetail
} from '../api/productionOrderDetail';

import { getInventoryIDsAndCodes } from '../api/inventory';

const ProductionOrderView = () => {
  const { id } = useParams(); // order ID
  const [order, setOrder] = useState(null);
  const [details, setDetails] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [inventoryMap, setInventoryMap] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDetail, setEditingDetail] = useState(null);

  const loadAll = async () => {
    const [orderRes, detailsRes, inventoryRes] = await Promise.all([
      getProductionOrder(id),
      getProductionOrderDetails(id),
      getInventoryIDsAndCodes()
    ]);

    const invMap = {};
    inventoryRes.data.forEach(item => {
      invMap[item.ID] = item.code;
    });

    setOrder(orderRes.data);
    setDetails(detailsRes.data);
    setInventoryItems(inventoryRes.data);
    setInventoryMap(invMap);
  };

  useEffect(() => {
    loadAll();
  }, [id]);

  const handleSaveDetail = async () => {
    const payload = {
      ...editingDetail,
      productionOrderID: parseInt(id),
      productID: parseInt(editingDetail.productID),
      quantityRequired: parseInt(editingDetail.quantityRequired),
      quantityLocked: parseInt(editingDetail.quantityLocked)
    };

    if (editingDetail.ID) {
      await updateProductionOrderDetail(editingDetail.ID, payload);
    } else {
      await createProductionOrderDetail(payload);
    }

    setDialogOpen(false);
    setEditingDetail(null);
    loadAll();
  };

  const handleDeleteDetail = async (detailID) => {
    await deleteProductionOrderDetail(detailID);
    loadAll();
  };

  return (
    <Container>
      <Box mt={3} mb={3}>
        <Typography variant="h4">Production Order #{id}</Typography>
      </Box>

      {order && (
        <Box mb={4}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={order.date}
                disabled
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Status"
                value={order.status}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Quantity Requested"
                fullWidth
                value={order.quantityRequested}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="User IDs"
                fullWidth
                value={order.userIDs || ''}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                fullWidth
                multiline
                minRows={3}
                value={order.notes || ''}
                disabled
              />
            </Grid>
          </Grid>

          {order.status !== 'Completed' && (
            <Box mt={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={async () => {
                  await updateProductionOrderStatusItem(id, order.status === 'Planned' ? 'In Progress' : 'Completed');
                  loadAll(); // ricarica i dati aggiornati
                }}
              >
                Promote to {order.status === 'Planned' ? 'In Progress' : 'Completed'}
              </Button>
            </Box>
          )}
        </Box>

      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Order Details</Typography>
        <Button startIcon={<AddIcon />} variant="contained" onClick={() => {
          setEditingDetail({ productID: '', quantityRequired: 1, quantityLocked: 0 });
          setDialogOpen(true);
        }}>
          Add Detail
        </Button>
      </Box>

      <Grid container spacing={2}>
        {details.map(detail => (
          <Grid item xs={12} sm={6} md={4} key={detail.ID}>
            <Card>
              <CardContent>
                <Typography variant="body1">
                  {inventoryMap[detail.productID] || `ID ${detail.productID}`}
                </Typography>
                <Typography variant="body2">
                  {detail.quantityLocked} / {detail.quantityRequired}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton onClick={() => {
                  setEditingDetail(detail);
                  setDialogOpen(true);
                }}><EditIcon /></IconButton>
                <IconButton onClick={() => handleDeleteDetail(detail.ID)}>
                  <DeleteIcon color="error" />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{editingDetail?.ID ? 'Edit Detail' : 'Add Detail'}</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Product"
            value={editingDetail?.productID || ''}
            onChange={(e) => setEditingDetail({ ...editingDetail, productID: e.target.value })}
            sx={{ mt: 2 }}
          >
            {inventoryItems.map(item => (
              <MenuItem key={item.ID} value={item.ID}>
                {item.code}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Quantity Required"
            type="number"
            fullWidth
            value={editingDetail?.quantityRequired || ''}
            onChange={(e) => setEditingDetail({ ...editingDetail, quantityRequired: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Quantity Locked"
            type="number"
            fullWidth
            value={editingDetail?.quantityLocked || ''}
            onChange={(e) => setEditingDetail({ ...editingDetail, quantityLocked: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveDetail}>
            {editingDetail?.ID ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductionOrderView;

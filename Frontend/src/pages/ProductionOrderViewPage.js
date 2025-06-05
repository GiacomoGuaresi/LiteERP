// src/pages/ProductionOrderView.js
import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Card, CardContent, CardActions, IconButton,
  Button, TextField, Grid, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Box,
  Stepper, Step, StepLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';

import { useParams } from 'react-router-dom';
import {
  getProductionOrder, updateProductionOrderStatusItem, getProductionOrderDetailsItems,
  updateProductionOrderItem
} from '../api/productionOrder';
import {
  createProductionOrderDetail,
  updateProductionOrderDetail, deleteProductionOrderDetail
} from '../api/productionOrderDetail';

import { getInventory } from '../api/inventory';
import { getInventoryItem } from '../api/inventory';

const ProductionOrderView = () => {
  const { id } = useParams(); // order ID
  const [order, setOrder] = useState(null);
  const [product, setProduct] = useState(null);
  const [details, setDetails] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [inventoryMap, setInventoryMap] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDetail, setEditingDetail] = useState(null);
  const [lastEdited, setLastEdited] = useState(null);

  const loadAll = async () => {
    // Prima carichi ordine, dettagli e inventario
    const [orderRes, detailsRes, inventoryRes] = await Promise.all([
      getProductionOrder(id),
      getProductionOrderDetailsItems(id),
      getInventory()
    ]);

    const orderData = orderRes.data;

    // Solo dopo aver ottenuto l'ordine, puoi accedere a orderData.productID
    const orderProduct = await getInventoryItem(orderData.productID);

    // Crea la mappa inventario
    const invMap = {};
    inventoryRes.data.forEach(item => {
      invMap[item.ID] = item.code;
    });

    // Imposta tutti gli stati
    setOrder(orderData);
    setDetails(detailsRes.data);
    setInventoryItems(inventoryRes.data);
    setInventoryMap(invMap);
    setProduct(orderProduct.data);
  };

  useEffect(() => {
    if (order) {
      const handler = setTimeout(async () => {
        await updateProductionOrderItem(id, order);
        setLastEdited(new Date());
      }, 1000); // salva 1 secondo dopo l'ultima modifica

      return () => clearTimeout(handler); // cancella timeout se cambia di nuovo prima
    }
  }, [order?.notes]);

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
    <Container fullWidth>
      <Box mt={3} mb={3} maxWidth="xl">
        <Typography variant="h4">Production Order {product ? product.code : 'Loading...'}</Typography>
      </Box>

      {order && (
        <Box mb={4} maxWidth="xl">
          <Grid container spacing={2}>
            <Grid size={12}>
              <Typography variant="subtitle2" color="text.secondary">Status</Typography>
              <Stepper activeStep={['Planned', 'In Progress', 'Completed'].indexOf(order.status)} alternativeLabel>
                {['Planned', 'In Progress', 'Completed'].map(label => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Grid>
            <Grid size={12}>
              <Typography variant="subtitle2" color="text.secondary">Order number</Typography>
              <Typography variant="body1" gutterBottom>{order.id}</Typography>
            </Grid>
            <Grid size={12}>
              <Typography variant="subtitle2" color="text.secondary">Date</Typography>
              <Typography variant="body1" gutterBottom>{order.date}</Typography>
            </Grid>
            <Grid size={12}>
              <Typography variant="subtitle2" color="text.secondary">Quantity Requested</Typography>
              <Typography variant="body1" gutterBottom>{order.quantityRequested}</Typography>
            </Grid>
            <Grid size={12}>
              <Typography variant="subtitle2" color="text.secondary">User IDs</Typography>
              <Typography variant="body1" gutterBottom>{order.userIDs || '-'}</Typography>
            </Grid>
            <Grid size={12}>
              {order.status === 'Planned' && (
                <Box mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={async () => {
                      const nextStatus = 'In Progress';
                      await updateProductionOrderStatusItem(id, nextStatus);
                      loadAll();
                    }}
                  >
                    Promote to In Progress
                  </Button>
                </Box>
              )}
            </Grid>
            <Grid size={12}>
              <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
              <TextField
                fullWidth
                multiline
                minRows={3}
                value={order?.notes || ''}
                onChange={(e) => setOrder({ ...order, notes: e.target.value })}
              />
              {lastEdited && (
                <Typography variant="caption" color="text.secondary">
                  Last edited: {lastEdited.toLocaleString()}
                </Typography>
              )}
            </Grid>
          </Grid>
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
                {(() => {
                  const item = inventoryItems.find(i => i.ID === detail.productID);
                  return item?.image ? (
                    <Box
                      component="img"
                      src={item.image}
                      alt={item.code}
                      sx={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 1, mb: 1 }}
                    />
                  ) : null;
                })()}
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

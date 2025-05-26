// src/pages/BomPage.js
import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Card, CardContent, CardActions, IconButton, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, TextField, Box, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { getInventoryIDsAndCodes } from '../api/inventory';
import {
  getBOMs, deleteBOM, updateBOM, createBOM
} from '../api/bom';

const BomPage = () => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [boms, setBoms] = useState([]);
  const [inventoryMap, setInventoryMap] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newParentMode, setNewParentMode] = useState(false);
  const [selectedParent, setSelectedParent] = useState('');
  const [newChild, setNewChild] = useState('');
  const [newQty, setNewQty] = useState(1);
  const [selectedBOM, setSelectedBOM] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const [bomRes, invRes] = await Promise.all([
      getBOMs(),
      getInventoryIDsAndCodes()
    ]);

    const invMap = {};
    invRes.data.forEach(item => {
      invMap[item.ID] = item.code;
    });

    setInventoryItems(invRes.data);
    setInventoryMap(invMap);
    setBoms(bomRes.data);
  };

  const groupedBOM = boms.reduce((acc, bom) => {
    if (!acc[bom.parentProductID]) acc[bom.parentProductID] = [];
    acc[bom.parentProductID].push(bom);
    return acc;
  }, {});

  const handleOpenDialog = (parentID = null) => {
    setSelectedParent(parentID);
    setNewChild('');
    setNewQty(1);
    setNewParentMode(parentID === null); // true se è un nuovo parent
    setDialogOpen(true);
  };

  const handleAddChild = async () => {
    const parentID = newParentMode ? parseInt(newChild) : selectedParent;

    await createBOM({
      parentProductID: parentID,
      childProductID: parseInt(newChild),
      quantity: parseInt(newQty)
    });

    setDialogOpen(false);
    loadAll();
  };

  const handleOpenEdit = (bom) => {
    setSelectedBOM(bom);
    setNewQty(bom.quantity);
    setEditDialogOpen(true);
  };

  const handleUpdateQuantity = async () => {
    await updateBOM(selectedBOM.ID, {
      ...selectedBOM,
      quantity: parseInt(newQty)
    });
    setEditDialogOpen(false);
    loadAll();
  };


  const confirmDelete = (id) => {
    setItemToDelete(id);
    setConfirmOpen(true);
  };

  const performDelete = async () => {
    if (itemToDelete) {
      loadAll();
      await deleteBOM(itemToDelete);
      setConfirmOpen(false);
      setItemToDelete(null);
      loadAll();
    }
  };


  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} mb={2}>
        <Typography variant="h4">Bill of Materials</Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => handleOpenDialog(null)}
        >
          BOM
        </Button>
      </Box>

      <Box display="flex" flexDirection="column" gap={4}>
        {Object.entries(groupedBOM).map(([parentID, children]) => (
          <Box key={parentID}>
            <Typography variant="h6" mb={1}>
              Parent: {inventoryMap[parentID] || `ID ${parentID}`}
            </Typography>
            <Grid container spacing={2}>
              {children.map(child => (
                <Grid item xs={12} sm={6} md={4} key={child.ID}>
                  <Card>
                    <CardContent>
                      <Typography variant="body1">
                        {inventoryMap[child.childProductID] || `ID ${child.childProductID}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Quantity: {child.quantity}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <IconButton size="small" onClick={() => handleOpenEdit(child)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => confirmDelete(child.ID)}><DeleteIcon fontSize="small" /></IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
              <Grid item xs={12}>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog(parseInt(parentID))}
                >
                  Add Child
                </Button>
              </Grid>
            </Grid>
          </Box>
        ))}
      </Box>

      {/* Add Child Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{newParentMode ? 'Create BOM' : 'Add Child Item'}</DialogTitle>
        <DialogContent>
          {newParentMode && (
            <TextField
              select
              fullWidth
              label="BOM Product"
              value={newChild}
              onChange={(e) => setNewChild(e.target.value)}
              sx={{ mt: 2 }}
            >
              {inventoryItems.map(item => (
                <MenuItem key={item.ID} value={item.ID}>
                  {item.code}
                </MenuItem>
              ))}
            </TextField>
          )}
          {!newParentMode && (
            <TextField
              select
              fullWidth
              label="Child Product"
              value={newChild}
              onChange={(e) => setNewChild(e.target.value)}
              sx={{ mt: 2 }}
            >
              {inventoryItems.map(item => (
                <MenuItem key={item.ID} value={item.ID}>
                  {item.code}
                </MenuItem>
              ))}
            </TextField>
          )}
          <TextField
            label="Quantity"
            type="number"
            value={newQty}
            onChange={(e) => setNewQty(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddChild} variant="contained">
            {newParentMode ? 'Create' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Quantity Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Quantity</DialogTitle>
        <DialogContent>
          <TextField
            label="New Quantity"
            type="number"
            value={newQty}
            onChange={(e) => setNewQty(e.target.value)}
            fullWidth
            inputProps={{ min: 1 }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateQuantity} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
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

export default BomPage;

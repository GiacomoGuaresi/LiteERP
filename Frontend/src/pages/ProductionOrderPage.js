// src/pages/ProductionOrderPage.js
import React, { useEffect, useState } from 'react';
import { getProductionOrder, deleteProductionOrderItem } from '../api/productionOrder';
import {
  Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Box, Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const ProductionOrderPage = () => {
  const [items, setItems] = useState([]);

  const loadProductionOrder = async () => {
    const res = await getProductionOrder();
    setItems(res.data);
  };

  const handleDelete = async (id) => {
    await deleteProductionOrderItem(id);
    loadProductionOrder();
  };

  useEffect(() => {
    loadProductionOrder();
  }, []);

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} mb={2}>
        <Typography variant="h4">Production Order</Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => window.location.href = '/inventory/create'}
        >
          New Production Order
        </Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>date</TableCell>
            <TableCell>productID</TableCell>
            <TableCell>quantityRequested</TableCell>
            <TableCell>quantityProduced</TableCell>
            <TableCell>status</TableCell>
            <TableCell>parentProductionOrderDetailsID</TableCell>
            <TableCell>userIDs</TableCell>
            <TableCell>notes</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map(item => (
            <TableRow key={item.ID}>
              <TableCell>{item.ID}</TableCell>
              <TableCell>{item.date}</TableCell>
              <TableCell>{item.productID}</TableCell>
              <TableCell>{item.quantityRequested}</TableCell>
              <TableCell>{item.quantityProduced}</TableCell>
              <TableCell>{item.status}</TableCell>
              <TableCell>{item.parentProductionOrderDetailsID}</TableCell>
              <TableCell>{item.userIDs}</TableCell>
              <TableCell>{item.notes}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleDelete(item.ID)}><DeleteIcon /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
};

export default ProductionOrderPage;

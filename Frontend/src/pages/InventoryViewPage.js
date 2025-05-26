import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getInventoryItem } from '../api/inventory';
import {
  Container, Typography, Paper, Box
} from '@mui/material';

const InventoryViewPage = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      const res = await getInventoryItem(id);
      setItem(res.data);
    };
    fetchItem();
  }, [id]);

  if (!item) return <Typography>Loading...</Typography>;

  return (
    <Container>
      <Typography variant="h4" mt={2}>View Inventory Item</Typography>
      <Paper sx={{ padding: 3, marginTop: 2 }}>
        <Box><strong>Code:</strong> {item.code}</Box>
        <Box><strong>Quantity on Hand:</strong> {item.quantity_on_hand}</Box>
        <Box><strong>Quantity Locked:</strong> {item.quantity_locked}</Box>
        <Box><strong>Category:</strong> {item.category}</Box>
        <Box><strong>Datas:</strong> {item.datas}</Box>
        {item.image && <img src={item.image} alt="Inventory" style={{ maxWidth: 200, marginTop: 10 }} />}
      </Paper>
    </Container>
  );
};

export default InventoryViewPage;

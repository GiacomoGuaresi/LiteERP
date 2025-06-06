import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress,
  Accordion, AccordionSummary, AccordionDetails, Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { getProductionOrderDetailsWithStatus } from '../api/productionOrderDetail';
import { getInventoryLight } from '../api/inventory';

const CATEGORIES = ['Product', 'Component', 'PrintedPart', 'Subassembly'];

const Dashboard = () => {
  const [dataByStatus, setDataByStatus] = useState({
    Planned: {},
    'In Progress': {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [plannedRes, inProgressRes, inventoryRes] = await Promise.all([
          getProductionOrderDetailsWithStatus('Planned'),
          getProductionOrderDetailsWithStatus('In Progress'),
          getInventoryLight()
        ]);

        // Costruisci una mappa: ID → { code, category }
        const inventoryMap = {};
        inventoryRes.data.forEach(item => {
          inventoryMap[item.ID] = {
            code: item.code,
            category: item.category
          };
        });

        const processData = (data) => {
          const grouped = {};

          data.forEach(item => {
            const diff = item.quantityRequired - item.quantityLocked;
            if (diff > 0) {
              const { productID } = item;
              const inventoryInfo = inventoryMap[productID];
              const code = inventoryInfo?.code || `ID ${productID}`;
              const category = inventoryInfo?.category || 'Unknown';

              if (!grouped[category]) grouped[category] = {};
              if (!grouped[category][productID]) {
                grouped[category][productID] = {
                  productID,
                  code,
                  quantity: 0,
                  category,
                };
              }

              grouped[category][productID].quantity += diff;
            }
          });

          // Converti ogni categoria in un array di righe
          const result = {};
          for (const category in grouped) {
            result[category] = Object.values(grouped[category]);
          }

          return result;
        };

        setDataByStatus({
          Planned: processData(plannedRes.data),
          'In Progress': processData(inProgressRes.data)
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const renderTable = (rows) => (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Product Code</TableCell>
            <TableCell>Missing Quantity</TableCell>
            <TableCell>Category</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow key={`${row.productID}-${idx}`}>
              <TableCell>{row.code}</TableCell>
              <TableCell>{row.quantity}</TableCell>
              <TableCell>{row.category}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderStatusSection = (status) => {
    // Controlla se tutte le righe sono vuote
    const isEmpty = CATEGORIES.every(
      category => (dataByStatus[status][category] || []).length === 0
    );

    if (isEmpty) {
      return (
        <div key={status}>
          <Typography variant="h5" mt={4} mb={1}>{status} Orders</Typography>
          <Typography color="textSecondary" mt={2}>Nothing to show here.</Typography>
        </div>
      );
    }

    return (
      <div key={status}>
        <Typography variant="h5" mt={4} mb={1}>{status} Orders</Typography>
        {CATEGORIES.map(category => {
          const rows = dataByStatus[status][category] || [];
          if (rows.length === 0) return null;

          return (
            <Accordion key={category}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{category} ({rows.length})</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {renderTable(rows)}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </div>
    );
  };


  if (loading) {
    return (
      <Container>
        <Typography variant="h4" mt={2}>Loading Dashboard...</Typography>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" mt={2}>LiteERP</Typography>
      <Typography mb={2}>Welcome to LiteERP the ERP made easy</Typography>
      <Divider />
      {renderStatusSection('Planned')}
      {renderStatusSection('In Progress')}
    </Container>
  );
};

export default Dashboard;

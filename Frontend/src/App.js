// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';

import InventoryPage from './pages/InventoryPage';
import InventoryViewPage from './pages/InventoryViewPage';
import InventoryEditPage from './pages/InventoryEditPage';
import InventoryCreatePage from './pages/InventoryCreatePage';

import ProductionOrderPage from './pages/ProductionOrderPage';
import ProductionOrderViewPage from './pages/ProductionOrderViewPage';

import BomPage from './pages/BomPage';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Definisci il tuo tema qui
const theme = createTheme({
  palette: {
    primary: {
      main: '#d72e28',
      light: '#80e27e',
      dark: '#087f23',
      contrastText: '#fff',
    },
  },
});

function App() {
   return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Per reset degli stili Material UI */}
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/inventory/edit/:id" element={<InventoryEditPage />} />
          <Route path="/inventory/view/:id" element={<InventoryViewPage />} />
          <Route path="/inventory/create" element={<InventoryCreatePage />} />

          <Route path="/ProductionOrder" element={<ProductionOrderPage />} />
          <Route path="/ProductionOrder/:id" element={<ProductionOrderViewPage />} />

          <Route path="/BOM" element={<BomPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
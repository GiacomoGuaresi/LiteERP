// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { AuthContextProvider } from './contexts/AuthContext'; // Importa AuthContextProvider

import Dashboard from './pages/Dashboard';

import LoginPage from './pages/LoginPage';
import MyUserPage from './pages/MyUserPage'
import UsersPage from './pages/UsersPage'

import InventoryPage from './pages/InventoryPage';
import InventoryScanPage from './pages/InventoryScanPage';

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
      contrastText: '#fff',
    },
  },
});

function App() {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {/* Avvolgi il Router con AuthContextProvider per fornire il contesto a tutta l'app */}
        <AuthContextProvider>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              
              <Route path="/login" element={<LoginPage />} />
              <Route path="/profile" element={<MyUserPage />} />
              <Route path="/users" element={<UsersPage />} />

              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/inventory/scanner" element={<InventoryScanPage />} />

              <Route path="/ProductionOrder" element={<ProductionOrderPage />} />
              <Route path="/ProductionOrder/:id" element={<ProductionOrderViewPage />} />

              <Route path="/BOM" element={<BomPage />} />
            </Routes>
          </Router>
        </AuthContextProvider>
      </ThemeProvider>
  );
}

export default App;

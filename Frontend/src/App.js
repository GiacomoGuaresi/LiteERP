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

function App() {
  return (
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
  );
}

export default App;
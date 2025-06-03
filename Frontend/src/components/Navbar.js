// src/components/Navbar.js
import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

import logo from '../logo.svg';

const Navbar = () => (
  <AppBar position="static">
    <Toolbar>
      <img src={logo} alt="Logo" style={{ height: 40 }}/>
      <Typography variant="h6" sx={{ flexGrow: 1, marginLeft: 1 }}>
        Lite ERP
      </Typography>
      <Button color="inherit" component={Link} to="/">Dashboard</Button>
      <Button color="inherit" component={Link} to="/inventory">Inventory</Button>
      <Button color="inherit" component={Link} to="/productionOrder">Production Order</Button>
      <Button color="inherit" component={Link} to="/BOM">BOM</Button>
    </Toolbar>
  </AppBar>
);

export default Navbar;

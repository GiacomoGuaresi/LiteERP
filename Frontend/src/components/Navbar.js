
import React, { useContext, useState, navi } from 'react';
import { AppBar, Toolbar, Typography, Button, Avatar, IconButton, Menu, MenuItem } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import logo from '../logo.svg';

const Navbar = () => {
  const { isLoggedIn, user, logout } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const getUserInitials = (name, surname) => {
    if (!name || !surname) return '';
    return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const handleProfileClick = () => {
    handleClose();
    navigate('/profile');
  };


  return (
    <AppBar position="static">
      <Toolbar>
        <img src={logo} alt="Logo" style={{ height: 40 }} />
        <Typography variant="h6" sx={{ flexGrow: 1, marginLeft: 1 }}>
          Lite ERP
        </Typography>

        {isLoggedIn ? (
          <>
            <Button color="inherit" component={Link} to="/">Dashboard</Button>
            <Button color="inherit" component={Link} to="/inventory">Inventory</Button>
            <Button color="inherit" component={Link} to="/productionOrder">Production Order</Button>
            <Button color="inherit" component={Link} to="/BOM">BOM</Button>
            <Button color="inherit" component={Link} to="/users">Users</Button>
            {user && (
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
                sx={{ marginLeft: 2 }}
              >
                <Avatar
                  sx={{
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    width: 35,
                    height: 35,
                    fontSize: '0.9rem',
                  }}
                >
                  {getUserInitials(user.name, user.surname)}
                </Avatar>
              </IconButton>
            )}
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={open}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfileClick}>My Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Button color="inherit" component={Link} to="/login">Login</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from "@apollo/react-hooks";

import {
  Container, AppBar, Toolbar, Typography, Grid, IconButton, Menu, MenuItem,
  CircularProgress, Button, Avatar,
} from '@material-ui/core';

import SelectedHeroes from './SelectedHeroes.jsx';


const QUERY = gql`
{ 
  viewer {
    id
    personaname
    avatarmedium
  }
}
`;


export default function Base() {
  const { loading, error, data } = useQuery(QUERY);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  if (error) return <p>Error :(</p>;
  if (loading) return (
    <Grid container justify="center">
      <CircularProgress />
    </Grid>
  );

  const handleMenu = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <AppBar color="primary">
        <Toolbar>
          <Grid
            justify="space-between"
            alignItems="center"
            container
          >
            <Grid item>
              <Typography variant="button">
                dotapra.cc
              </Typography>
            </Grid>

            <Grid item>
              { data.viewer == null ? (
                <Button color="inherit" href={LOGIN_URL}>Login</Button>
              ) : (
                <div>
                  <IconButton
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleMenu}
                    color="inherit"
                  >
                     <Avatar
                       alt={data.viewer.personaname}
                       src={data.viewer.avatarmedium}
                     />
                  </IconButton>
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
                    <MenuItem
                      onClick={() => { window.location.href = LOGOUT_URL; }}
                    >
                      Log out
                    </MenuItem>
                  </Menu>
                </div>
              )}
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <Container style={{ marginTop: 80 }} fixed={true} >
        <SelectedHeroes />
      </Container>
    </>
  );
}

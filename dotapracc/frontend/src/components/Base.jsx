import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from "@apollo/react-hooks";

import {
  Container, AppBar, Toolbar, Typography, Grid, IconButton, Menu, MenuItem,
  CircularProgress, Avatar, Button,
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
            container
            justify="space-between"
            alignItems="center"
          >
            <Grid item>
              <Typography variant="button">
                dotapra.cc
              </Typography>
            </Grid>

            <Grid item>
              { data.viewer == null ? (
                <img
                  src="/static/frontend/steam.png"
                  onClick={() => { window.location.href = LOGIN_URL; }}
                  style={{ cursor: 'pointer' }}
                />
              ) : (
                <Grid
                  container
                  direction="row"
                  alignItems="center"
                >
                  <Grid item>
                    <Button
                      variant="text"
                      color="inherit"
                      onClick={handleMenu}
                      endIcon={
                        <Avatar
                          alt={data.viewer.personaname}
                          src={data.viewer.avatarmedium}
                         />
                      }
                    >
                      {data.viewer.personaname}
                    </Button>

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
                  </Grid>
                </Grid>
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

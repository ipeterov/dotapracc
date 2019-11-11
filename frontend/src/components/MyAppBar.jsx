import React from 'react';
import { Link as RouterLink } from "react-router-dom";
import gql from 'graphql-tag';
import { useQuery } from "@apollo/react-hooks";

import {
  AppBar, Toolbar, Grid, Link, Menu, MenuItem, Avatar, Button, CircularProgress,
} from '@material-ui/core';

import MatchFinder from './MatchFinder.jsx';


const QUERY = gql`
  { 
    viewer {
      id
      personaname
      avatarmedium
    }
  }
`;

export default function MyAppBar() {
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
    <AppBar color="primary">
      <Toolbar>
        <Grid
          container
          justify="space-between"
          alignItems="center"
        >
          <Grid item>
            <Grid
              container
              alignItems="center"
              spacing={1}
            >
              <Grid item>
                <Link
                  variant="button"
                  color="inherit"
                  component={RouterLink}
                  to="/"
                >
                  dotapra.cc
                </Link>
              </Grid>
              <Grid item>
                <Link
                  variant="overline"
                  color="inherit"
                  component={RouterLink}
                  to="/"
                >
                  Profile
                </Link>
              </Grid>
              <Grid item>
                <Link
                  variant="overline"
                  color="inherit"
                  component={RouterLink}
                  to="/about/"
                >
                  About
                </Link>
              </Grid>
            </Grid>
          </Grid>

          <Grid item>
            { data.viewer == null ? (
              <img
                alt="Sign in with Steam"
                src="/static/frontend/steam.png"
                onClick={() => { window.location.href = LOGIN_URL; }}
                style={{ cursor: 'pointer' }}
              />
            ) : (
              <Grid
                container
                direction="row"
                alignItems="center"
                spacing={2}
              >
                <Grid item>
                  <MatchFinder />
                </Grid>

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
  );
}

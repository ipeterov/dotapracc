import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from "@apollo/react-hooks";
import { withStyles } from '@material-ui/core/styles';

import {
  Grid, Menu, MenuItem, Avatar, Button, CircularProgress,
} from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { Skeleton } from "@material-ui/lab";

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

const styles = {
  startIcon: { marginRight: 0 },
};


function AvatarSection({ classes }) {
  const { loading, error, data } = useQuery(QUERY);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  if (error) return <p>Error :(</p>;
  if (loading) return (
    <Grid container
      direction="row"
      justify="flex-end"
      alignItems="center"
      spacing={1}
    >
      <Grid item>
        <Skeleton variant="rect" width={200} />
      </Grid>
      <Grid item>
        <Skeleton variant="circle" width={40} height={40} />
      </Grid>
    </Grid>
  );

  const handleMenu = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (data.viewer == null) {
    return (
      <img
        alt="Sign in with Steam"
        src="/static/frontend/steam.png"
        onClick={() => { window.location.href = LOGIN_URL; }}
        style={{ cursor: 'pointer' }}
      />
    );
  }

  return (
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
          classes={{ startIcon: classes.startIcon }}
          variant="text"
          color="inherit"
          onClick={handleMenu}
          startIcon={
            <ArrowDropDownIcon />
          }
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
  );
}

export default withStyles(styles)(AvatarSection);
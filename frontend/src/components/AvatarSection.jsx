import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import {
  Avatar,
  Button,
  Grid,
  Menu,
  MenuItem,
} from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { Skeleton } from '@material-ui/lab';

import MatchFinder from './MatchFinder';
import SteamSignIn from './SteamSignIn';


const QUERY = gql`
  { 
    viewer {
      __typename
      id
      personaname
      avatarmedium
      selectedHeroes { id }
    }
  }
`;


export default function AvatarSection() {
  const { loading, error, data } = useQuery(QUERY);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  let zeroHeroesSelected;
  if (loading || !data.viewer) {
    zeroHeroesSelected = false;
  } else {
    zeroHeroesSelected = data.viewer.selectedHeroes.length === 0;
  }

  if (error) return <p>Error :(</p>;
  if (loading) {
    return (
      <Grid
        container
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
  }

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (data.viewer == null) {
    return <SteamSignIn />;
  }

  return (
    <Grid
      container
      direction="row"
      alignItems="center"
      spacing={1}
    >
      <Grid item>
        <MatchFinder zeroHeroesSelected={zeroHeroesSelected} />
      </Grid>

      <Grid item>
        <Button
          variant="text"
          color="inherit"
          onClick={handleMenu}
          startIcon={
            <ArrowDropDownIcon />
          }
          endIcon={(
            <Avatar
              alt={data.viewer.personaname}
              src={data.viewer.avatarmedium}
            />
          )}
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
            /* eslint-disable-next-line no-undef */
            onClick={() => { window.location.href = LOGOUT_URL; }}
          >
            Log out
          </MenuItem>
        </Menu>
      </Grid>
    </Grid>
  );
}

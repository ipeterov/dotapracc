import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { withStyles } from '@material-ui/core/styles';
import {
  Avatar,
  Button,
  Grid,
  Link,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { Skeleton } from '@material-ui/lab';

import MatchFinder from './MatchFinder';


const QUERY = gql`
  { 
    viewer {
      id
      personaname
      avatarmedium
      selectedHeroes { id }
    }
  }
`;

const HtmlTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: '#ffffff',
    color: '#000000',
    maxWidth: 400,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}))(Tooltip);

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
    return (
      <HtmlTooltip
        interactive
        title={(
          <Typography>
            It's safe. dotapra.cc only gets your public info, like avatar and username.
            We took this image from an{' '}
            <Link
              target="_blank"
              href="https://steamcommunity.com/dev"
            >
              official steam page
            </Link>
            . Here's a{' '}
            <Link
              target="_blank"
              href="https://steamcommunity.com/discussions/forum/1/620696522175992548/"
            >
              steamcommunity thread
            </Link>
            {' '}about safety of Steam OpenID.
          </Typography>
        )}
      >
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <img
          alt="Sign in with Steam"
          src="/static/frontend/steam.png"
          /* eslint-disable-next-line no-undef */
          onClick={() => { window.location.href = LOGIN_URL; }}
          style={{ cursor: 'pointer', marginTop: 4 }}
        />
      </HtmlTooltip>
    );
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

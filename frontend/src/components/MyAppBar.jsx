import React from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import {
  AppBar, Grid, Link, Toolbar, Typography,
} from '@material-ui/core';

import AvatarSection from './AvatarSection';


const menuItems = [
  { label: 'About', link: '/about/' },
  { label: 'Profile', link: '/' },
  { label: 'Referrals', link: '/refs/' },
];


function MyAppBar({ location }) {
  return (
    <AppBar color="primary">
      <Toolbar>
        <Grid
          container
          direction="row"
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
                <Typography
                  color="secondary"
                  variant="button"
                >
                  dotapra.cc
                </Typography>
              </Grid>
              {menuItems.map(({ label, link }) => (
                <Grid item key={label}>
                  <Link
                    variant="overline"
                    color="inherit"
                    component={RouterLink}
                    to={link}
                    style={link === location.pathname ? { textDecoration: 'underline' } : {}}
                  >
                    {label}
                  </Link>
                </Grid>
              ))}
            </Grid>
          </Grid>
          {location.pathname !== '/wizard/' && (
            <Grid item>
              <AvatarSection />
            </Grid>
          )}
        </Grid>
      </Toolbar>
    </AppBar>
  );
}

MyAppBar.propTypes = {
  location: PropTypes.object.isRequired,
};

export default withRouter(MyAppBar);

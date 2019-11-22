import {Link as RouterLink} from 'react-router-dom';
import {AppBar, Grid, Link, Toolbar, Typography,} from '@material-ui/core';

import AvatarSection from './AvatarSection.jsx';


export default function MyAppBar() {
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
                <Typography
                  color="inherit"
                  variant="button"
                >
                  dotapra.cc
                </Typography>
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
            <AvatarSection />
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
}

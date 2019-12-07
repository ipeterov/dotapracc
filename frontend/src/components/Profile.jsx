import React from 'react';
import { Grid, Typography } from '@material-ui/core';

import ProfileVariables from './ProfileVariables';
import SelectedHeroes from './SelectedHeroes';
import Stats from './Stats';


export default function Profile() {
  return (
    <>
      <Stats />
      <Grid container spacing={3} direction="column">
        <Grid item>
          <Typography variant="h5" style={{ marginBottom: 8 }}>
            Profile
          </Typography>
          <ProfileVariables />
        </Grid>

        <Grid item>
          <Typography variant="h5" style={{ marginBottom: 8 }}>
            Selected heroes
          </Typography>
          <SelectedHeroes />
        </Grid>
      </Grid>
    </>
  );
}

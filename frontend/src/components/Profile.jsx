import React from 'react';

import { Typography, Grid } from '@material-ui/core';

import SelectedHeroes from './SelectedHeroes.jsx';
import ProfileVariables from './ProfileVariables.jsx';


export default function Profile() {
  return (
    <Grid container spacing={2} direction="column">
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
  );
}

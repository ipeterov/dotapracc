import React from 'react';

import { Typography } from '@material-ui/core';

import SelectedHeroes from './SelectedHeroes.jsx';
import ProfileVariables from './ProfileVariables.jsx';


export default function Profile() {
  return (
    <>
      <Typography
        variant="h5"
        style={{ marginBottom: '8px', marginTop: '16px' }}
      >
        Profile
      </Typography>
      <ProfileVariables />

      <Typography
        variant="h5"
        style={{ marginBottom: '8px', marginTop: '16px' }}
      >
        Selected heroes
      </Typography>
      <SelectedHeroes />
    </>
  );
}

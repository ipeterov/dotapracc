import React from 'react';

import {
  Container, AppBar, Toolbar, Typography, Button
} from '@material-ui/core';

import SelectedHeroes from './SelectedHeroes.jsx';


export default function Base() {
  return (
    <>
      <AppBar color="primary">
        <Toolbar>
          <Typography variant="button">
            dotapra.cc
          </Typography>
          <Button variant="text" >My profile</Button>
        </Toolbar>
      </AppBar>
      <Container style={{ marginTop: 80 }} fixed={true} >
        <SelectedHeroes />
      </Container>
    </>
  );
}

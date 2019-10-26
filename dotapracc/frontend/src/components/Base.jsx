import React from 'react';
import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';

import {
  Button, CircularProgress, Container, AppBar, Toolbar, IconButton, Typography,
  Grid,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';

import SelectedHeroes from './SelectedHeroes.jsx';


const QUERY = gql`
{ 
  viewer {
    id
    username
    selectedHeroes {
      id
      addAllMids
      addCounters
      addEasyLanes
      wantedMatchups { id name }
      hero {
        id
        name
        counters { id name }
        easyLanes { id name }
      }
    }
  } 
}
`;


export default function Base() {
  const { loading, error, data } = useQuery(QUERY);

  if (loading) return <CircularProgress />;
  if (error) return <p>Error :(</p>;

  return (
    <>
      <AppBar>
        <Toolbar>
          <IconButton edge="start">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6">
            News
          </Typography>
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>
      <Container style={{ marginTop: 80 }}>
        <Grid container spacing={2}>
          <Grid item>
            <Button variant="contained" color="primary">
              Add selected hero
            </Button>
          </Grid>

          <Grid item>
            <SelectedHeroes selectedHeroes={data.viewer.selectedHeroes}/>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

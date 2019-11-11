import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import { Container } from '@material-ui/core';

import About from './About.jsx';
import Profile from './Profile.jsx';
import MyAppBar from './MyAppBar.jsx';
import Stats from './Stats.jsx';


export default function Base() {
  return (
    <Router>
      <MyAppBar />
      <Container style={{ marginTop: 80 }} fixed={true} >
        <Stats />
        <Switch>
          <Route path="/about/">
            <About />
          </Route>
          <Route path="/">
            <Profile />
          </Route>
        </Switch>
       </Container>
    </Router>
  );
}

import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Container } from '@material-ui/core';

import About from './About';
import Profile from './Profile';
import MyAppBar from './MyAppBar';
import Stats from './Stats';
import Footer from './Footer';


export default function Base() {
  return (
    <Router>
      <MyAppBar />
      <Container
        fixed
        style={{
          paddingTop: 72,
          paddingBottom: 36,
          minHeight: 'calc(100vh - 116px)',
        }}
      >
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
      <Footer />
    </Router>
  );
}

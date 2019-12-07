import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Container } from '@material-ui/core';

import About from './About';
import Footer from './Footer';
import MyAppBar from './MyAppBar';
import Profile from './Profile';
import Referrals from './Referrals';
import Wizard from './Wizard';


export default function Base() {
  return (
    <Router>
      <MyAppBar />
      <Container
        fixed
        style={{
          paddingTop: 72,
          paddingBottom: 8,
          minHeight: 'calc(100vh - 116px)',
        }}
      >
        <Switch>
          <Route path="/refs/">
            <Referrals />
          </Route>
          <Route path="/about/">
            <About />
          </Route>
          <Route path="/wizard/">
            <Wizard />
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

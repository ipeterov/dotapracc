import {BrowserRouter as Router, Route, Switch,} from 'react-router-dom';
import {Container} from '@material-ui/core';

import About from './About.jsx';
import Profile from './Profile.jsx';
import MyAppBar from './MyAppBar.jsx';
import Stats from './Stats.jsx';
import Footer from './Footer.jsx';


export default function Base() {
  return (
    <Router>
      <MyAppBar />
      <Container
        style={{
          paddingTop: 72,
          paddingBottom: 36,
          minHeight: 'calc(100vh - 116px)',
        }}
        fixed={true}
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

import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from '@apollo/react-hooks';
import ApolloClient from 'apollo-boost';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import Base from './Base';


const client = new ApolloClient({ uri: `${window.location.origin}/gql/` });

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#283593',
    },
    secondary: {
      main: '#ffca28',
    },
    background: {
      paper: '#fff',
      default: '#f1f1f1',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <ApolloProvider client={client}>
        <CssBaseline />
        <Base />
      </ApolloProvider>
    </ThemeProvider>
  );
}

ReactDOM.render(<App />, document.getElementById('app'));

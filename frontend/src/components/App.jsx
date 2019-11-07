import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from '@apollo/react-hooks';
import { SnackbarProvider } from 'notistack';
import ApolloClient from 'apollo-boost';

import Base from './Base.jsx'


const client = new ApolloClient(
  { uri: `${window.location.origin}/gql/` }
);

class App extends React.Component {
  render() {
    return (
      <SnackbarProvider>
        <ApolloProvider client={client}>
          <Base/>
        </ApolloProvider>
      </SnackbarProvider>
    )
  }
}

ReactDOM.render(<App />, document.getElementById("app"));

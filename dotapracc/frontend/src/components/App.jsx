import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from '@apollo/react-hooks';
import ApolloClient from 'apollo-boost';

import Base from './Base.jsx'


const client = new ApolloClient(
  { uri: `${window.location.href}gql/` }
);

class App extends React.Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <Base/>
      </ApolloProvider>
    )
  }
}

ReactDOM.render(<App />, document.getElementById("app"));

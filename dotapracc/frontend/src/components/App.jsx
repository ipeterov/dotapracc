import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from '@apollo/react-hooks';
import ApolloClient from 'apollo-boost';

import Base from './Base.jsx'


const apiUrl = process.env.NODE_ENV === 'development' ?
  'http://localhost:8000/gql/' : 'http://dotapra.cc/gql/';
const client = new ApolloClient({ uri: apiUrl });

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

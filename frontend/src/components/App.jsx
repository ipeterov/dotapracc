import React from 'react';
import ReactDOM from 'react-dom';
import {ApolloProvider} from '@apollo/react-hooks';
import {SnackbarProvider} from 'notistack';
import ApolloClient from 'apollo-boost';
import WebfontLoader from '@dr-kobros/react-webfont-loader';

import Base from './Base.jsx';


const client = new ApolloClient(
  { uri: `${window.location.origin}/gql/` }
);

const config = {
  google: {
    families: ['Roboto:300,400,500,700'],
  }
};

class App extends React.Component {
  render() {
    return (
      <WebfontLoader config={config}>
        <SnackbarProvider>
          <ApolloProvider client={client}>
            <Base/>
          </ApolloProvider>
        </SnackbarProvider>
      </WebfontLoader>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));

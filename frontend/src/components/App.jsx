import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from '@apollo/react-hooks';
import ApolloClient from 'apollo-boost';
import WebfontLoader from '@dr-kobros/react-webfont-loader';

import Base from './Base';


const client = new ApolloClient({ uri: `${window.location.origin}/gql/` });

const config = {
  google: { families: ['Roboto:300,400,500,700'] },
};

function App() {
  return (
    <WebfontLoader config={config}>
      <ApolloProvider client={client}>
        <Base />
      </ApolloProvider>
    </WebfontLoader>
  );
}

ReactDOM.render(<App />, document.getElementById('app'));

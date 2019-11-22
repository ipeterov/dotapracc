import _ from 'lodash';
import React from 'react';
import autoBind from 'react-autobind';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { Grid, Typography } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

// eslint-disable-next-line no-undef
const prefix = process.env.NODE_ENV === 'development' ? 'ws' : 'wss';
const wsUrl = `${prefix}://${window.location.host}/ws/stats`;


export default class Stats extends React.Component {
  constructor(props) {
    super(props);
    autoBind(this);

    this.state = {
      loading: true,
      stats: {},
    };

    this.connect();
  }

  connect() {
    this.sock = new W3CWebSocket(wsUrl);

    this.sock.onmessage = (message) => {
      const stats = JSON.parse(message.data);
      this.setState({ stats, loading: false });
    };

    this.sock.onclose = () => {
      this.setState({ loading: true });
      setTimeout(() => {
        this.connect();
      }, 1000);
    };
  }

  renderStats() {
    if (this.state.loading) return <Skeleton variant="rect" height={24} />;

    return (
      <Typography color="textSecondary">
        {_.map(this.state.stats, (value, name) => `${name}: ${value}`).join(' | ')}
      </Typography>
    );
  }

  render() {
    return (
      <Grid container direction="row" justify="space-between">
        <Grid item />
        <Grid
          item
          style={this.state.loading ? { width: '580px' } : {}}
        >
          {this.renderStats()}
        </Grid>
      </Grid>
    );
  }
}

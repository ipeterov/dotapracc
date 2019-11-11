import _ from 'lodash';
import React from 'react';
import autoBind from 'react-autobind';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { Typography } from "@material-ui/core";


const prefix = process.env.NODE_ENV === 'development' ? 'ws' : 'wss';
const wsUrl = `${prefix}://${window.location.host}/ws/stats`;


export default class Stats extends React.Component {
  constructor(props) {
    super(props);
    autoBind(this);

    this.state = {
      connected: false,
      stats: {},
    };

    this.connect();
  }

  connect() {
    this.sock = new W3CWebSocket(wsUrl);

    this.sock.onmessage = (message) => {
      const stats = JSON.parse(message.data);
      this.setState({ stats });
    };

    this.sock.onopen = () => {
      this.setState({connected: true});
    };

    this.sock.onclose = () => {
      this.setState({connected: false});
      setTimeout(() => {
        this.connect();
      }, 1000);
    };
  }

  render() {
    return (
      <Typography color="textSecondary">
        {
          _.map(this.state.stats, (value, name) => {
            return `${name}: ${value}`;
          }).join(', ')
        }
      </Typography>
    );
  }
}

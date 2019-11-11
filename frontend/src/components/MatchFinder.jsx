import React from 'react';
import ReactTimeAgo from 'react-time-ago';
import autoBind from 'react-autobind';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

import {
  Typography, Dialog, DialogActions, DialogContent, Grid, DialogTitle, Table,
  TableBody, TableRow, TableCell, LinearProgress,
} from '@material-ui/core';

import MyButton from './MyButton.jsx';


const SEARCHING = 'searching';
const FOUND_MATCH = 'found_match';
const ACCEPTED_MATCH = 'accepted_match';
const LOBBY_SETUP = 'lobby_setup';
const IN_LOBBY = 'in_lobby';

const prefix = process.env.NODE_ENV === 'development' ? 'ws' : 'wss';
const wsUrl = `${prefix}://${window.location.host}/ws/find_match`;


export default class MatchFinder extends React.Component {
  constructor(props) {
    super(props);
    autoBind(this);

    this.state = {
      connected: false,
    };

    this.connect();
  }

  connect() {
    this.sock = new W3CWebSocket(wsUrl);

    this.sock.onmessage = (message) => {
      const newState = JSON.parse(message.data);
      console.log(message);
      newState.waitingForResponse = false;
      this.setState(newState);
    };

    this.sock.onopen = () => {
      this.setState({ connected: true });
    };

    this.sock.onclose = () => {
      this.setState({ connected: false });
      setTimeout(() => {
        this.connect();
      }, 1000);
    };
  }

  sendCommand(command) {
    return () => {
      this.setState({ waitingForResponse: true }, () => {
        this.sock.send(command);
      });
    };
  }

  renderOpponentDetails() {
    return (
      <Table>
        <TableBody>
          <TableRow>
            <TableCell align="left">Opponent</TableCell>
            <TableCell align="right">
              {this.state.opponent.personaName}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="left">MMR estimate (from OpenDota)</TableCell>
            <TableCell align="right">
              {this.state.opponent.mmrEstimate}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="left">Profile text</TableCell>
            <TableCell align="right">
              {this.state.opponent.profileText}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="left">Possible matchups</TableCell>
            <TableCell align="right">
              {this.state.heroPairs.length}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  renderSearchButton() {
    return (
      <MyButton
        onClick={this.sendCommand('start_search')}
        variant="contained"
        color="secondary"
        loading={this.state.waitingForResponse}
      >
        Find match
      </MyButton>
    );
  }

  renderCancelButton() {
    const startedAt = new Date(this.state.startedAt);
    return (
      <Grid
        container
        spacing={1}
        alignItems="center"
      >
        <Grid item >
          <Typography variant="overline">
            Searching for:{' '}
            <ReactTimeAgo
              date={startedAt}
              updateInterval={500}
              timeStyle={{
                gradation: [
                  {
                    format: (value) => {
                      const td = Math.trunc((new Date() - value) / 1000);
                      const minutes = Math.floor(td / 60);
                      const seconds = (td % 60).toString().padStart(2, '0');
                      return `${minutes}:${seconds}`;
                    },
                  },
                ],
              }}
            />
          </Typography>
        </Grid>
        <Grid item >
          <MyButton
            onClick={this.sendCommand('cancel')}
            variant="contained"
            color="secondary"
            loading={this.state.waitingForResponse}
          >
            Cancel search
          </MyButton>
        </Grid>
      </Grid>
    );
  }

  renderFoundMatchDialog() {
    return (
      <Dialog open={true}>
        <DialogTitle>Found match</DialogTitle>
        <DialogContent>
          {this.renderOpponentDetails()}
        </DialogContent>
        <DialogActions>
          <MyButton
            onClick={this.sendCommand('accept_match')}
            variant="contained"
            color="primary"
            loading={this.state.waitingForResponse}
          >
            Accept
          </MyButton>
          <MyButton
            onClick={this.sendCommand('cancel')}
            variant="contained"
            color="secondary"
            loading={this.state.waitingForResponse}
          >
            Decline
          </MyButton>
        </DialogActions>
      </Dialog>
    );
  }

  renderWaitingForAcceptDialog() {
    return (
      <Dialog open={true}>
        <DialogTitle>Waiting for other player to accept</DialogTitle>
        <DialogContent>
          <LinearProgress />
        </DialogContent>
      </Dialog>
    );
  }

  renderWaitingForLobbyDialog() {
    return (
      <Dialog open={true}>
        <DialogTitle>Bot dispatched to create lobby</DialogTitle>
        <DialogContent>
          <img
            src="/static/frontend/bot_running.gif"
            alt="Bot running"
            width="280px"
          />
        </DialogContent>
      </Dialog>
    );
  }

  renderWaitingInLobbyDialog() {
    return (
      <Dialog open={true}>
        <DialogTitle>Waiting for other player to join lobby</DialogTitle>
        <DialogContent>
          <LinearProgress />
        </DialogContent>
      </Dialog>
    );
  }

  render() {
    const state = this.state.state;

    if (!this.state.connected) {
      return <Typography>Connecting to dotapra.cc coordinator</Typography>;
    }

    if (state === SEARCHING) {
      return this.renderCancelButton();
    } else if (state === FOUND_MATCH) {
      return (
        <>
          <Typography>Found match</Typography>
          {this.renderFoundMatchDialog()}
        </>
      );
    } else if (state === ACCEPTED_MATCH) {
      return (
        <>
          <Typography>Waiting for other player to accept</Typography>
          {this.renderWaitingForAcceptDialog()}
        </>
      );
    } else if (state === LOBBY_SETUP) {
      return (
        <>
          <Typography>Setting up lobby</Typography>
          {this.renderWaitingForLobbyDialog()}
        </>
      );
    } else if (state === IN_LOBBY) {
      return (
        <>
          <Typography>Waiting for other player to join</Typography>
          {this.renderWaitingInLobbyDialog()}
        </>
      );
    }

    return this.renderSearchButton();
  }
}

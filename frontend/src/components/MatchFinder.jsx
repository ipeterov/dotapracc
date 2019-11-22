import React from 'react';
import ReactTimeAgo from 'react-time-ago';
import autoBind from 'react-autobind';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@material-ui/core';
import Notification from 'react-web-notification/lib/components/Notification';

import MyButton from './MyButton';


const SEARCHING = 'searching';
const FOUND_MATCH = 'found_match';
const ACCEPTED_MATCH = 'accepted_match';
const LOBBY_SETUP = 'lobby_setup';
const LOBBY_READY = 'lobby_ready';
const IN_LOBBY = 'in_lobby';

// eslint-disable-next-line no-undef
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
        disabled={!this.state.connected}
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
        <Grid item>
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
        <Grid item>
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
    const source = '/static/frontend/match_found.mp3';
    const options = {
      body: `Opponent: ${this.state.opponent.personaName}`,
      audio: source,
    };

    return (
      <>
        <Dialog open>
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
        <Notification
          title="Match found"
          options={options}
          onShow={() => { document.getElementById('sound').play(); }}
        />
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio id="sound" preload="auto" loop>
          <source src={source} type="audio/mpeg" />
          <embed hidden="true" autostart="false" loop="true" src={source} />
        </audio>
      </>
    );
  }

  static renderWaitingForAcceptDialog() {
    return (
      <Dialog open>
        <DialogTitle>Waiting for other player to accept</DialogTitle>
        <DialogContent>
          <LinearProgress />
        </DialogContent>
      </Dialog>
    );
  }

  static renderWaitingForLobbyDialog() {
    return (
      <Dialog open>
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

  static renderLobbyReadyDialog() {
    return (
      <Dialog open>
        <DialogTitle>Lobby created, waiting for players to join</DialogTitle>
        <DialogContent>
          <LinearProgress />
        </DialogContent>
      </Dialog>
    );
  }

  static renderWaitingInLobbyDialog() {
    return (
      <Dialog open>
        <DialogTitle>Waiting for other player to join lobby</DialogTitle>
        <DialogContent>
          <LinearProgress />
        </DialogContent>
      </Dialog>
    );
  }

  render() {
    const state = this.state.state;

    if (state === SEARCHING) {
      return this.renderCancelButton();
    }
    if (state === FOUND_MATCH) {
      return (
        <>
          <Typography>Found match</Typography>
          {this.renderFoundMatchDialog()}
        </>
      );
    }
    if (state === ACCEPTED_MATCH) {
      return (
        <>
          <Typography>Waiting for other player to accept</Typography>
          {MatchFinder.renderWaitingForAcceptDialog()}
        </>
      );
    }
    if (state === LOBBY_SETUP) {
      return (
        <>
          <Typography>Setting up lobby</Typography>
          {MatchFinder.renderWaitingForLobbyDialog()}
        </>
      );
    }
    if (state === LOBBY_READY) {
      return (
        <>
          <Typography>Lobby created, waiting for players to join</Typography>
          {MatchFinder.renderLobbyReadyDialog()}
        </>
      );
    }
    if (state === IN_LOBBY) {
      return (
        <>
          <Typography>Waiting for other player to join</Typography>
          {MatchFinder.renderWaitingInLobbyDialog()}
        </>
      );
    }

    return this.renderSearchButton();
  }
}

import _ from 'lodash';
import React from 'react';
import ReactTimeAgo from 'react-time-ago';
import autoBind from 'react-autobind';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

import {
  Typography, Dialog, DialogActions, DialogContent, CircularProgress, Grid,
  DialogTitle, Table, TableBody, TableRow, TableCell, TextField, Tooltip,
} from '@material-ui/core';
import {CopyToClipboard} from 'react-copy-to-clipboard';

import MyButton from './MyButton.jsx';


export default class MatchFinder extends React.Component {
  constructor(props) {
    super(props);
    autoBind(this);

    this.state = {
      loading: null,
      postMatchOpen: false,
      state: null,
      startedAt: null,
      opponent: {},
      heroPairs: [],
      copied: false,
    };

    this.sock = new W3CWebSocket(`ws://${window.location.host}/ws/find_match`);
  }

  componentDidMount() {
    this.sock.onmessage = (message) => {
      const {
        state,
        startedAt,
        opponent,
        heroPairs,
      } = JSON.parse(message.data);
      const loading = false;
      const postMatchOpen = state === 'finished';
      const copied = false;
      this.setState({
        state,
        startedAt,
        opponent,
        heroPairs,
        loading,
        postMatchOpen,
        copied,
      });
    };
  }

  startSearch() {
    this.setState({ loading: true }, () => {
      this.sock.send('start_search');
    });
  }

  cancelSearch() {
    this.setState({ loading: true }, () => {
      this.sock.send('cancel_search');
    });
  }

  acceptMatch() {
    this.setState({ loading: true }, () => {
      this.sock.send('accept_match');
    });
  }

  declineMatch() {
    this.setState({ loading: true }, () => {
      this.sock.send('decline_match');
    });
  }

  renderOpponentDetails() {
    return (
      <Table>
        <TableBody>
          <TableRow>
            <TableCell align="left">Opponent</TableCell>
            <TableCell />
            <TableCell align="right">
              {this.state.opponent.personaName}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="left">MMR estimate (from OpenDota)</TableCell>
            <TableCell />
            <TableCell align="right">
              {this.state.opponent.mmrEstimate}
            </TableCell>
          </TableRow>
          {_.map(this.state.heroPairs, (heroPair) => {
              const [hero, matchup] = heroPair;
              return (
                <TableRow key={hero + matchup}>
                  <TableCell align="left">{hero}</TableCell>
                  <TableCell align="center">vs</TableCell>
                  <TableCell align="right">{matchup}</TableCell>
                </TableRow>
              );
          })}
        </TableBody>
      </Table>
    );
  }

  render() {
    if (this.state.state === null) {
      return <CircularProgress color="secondary" />;
    }

    if (this.state.state === 'started_search') {
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
              onClick={this.cancelSearch}
              variant="contained"
              color="secondary"
              loading={this.state.loading}
            >
              Cancel search
            </MyButton>
          </Grid>
        </Grid>
        );
    } else if (this.state.state === 'found_match') {
      return (
        <>
          <Typography>Found match</Typography>
          <Dialog open={true}>
            <DialogTitle>Found match</DialogTitle>
            <DialogContent>
              {this.renderOpponentDetails()}
            </DialogContent>
            <DialogActions>
              <MyButton
                onClick={this.acceptMatch}
                variant="contained"
                color="primary"
                loading={this.state.loading}
              >
                Accept
              </MyButton>
              <MyButton
                onClick={this.declineMatch}
                variant="contained"
                color="secondary"
                loading={this.state.loading}
              >
                Decline
              </MyButton>
            </DialogActions>
          </Dialog>
        </>
      );
    } else if (this.state.state === 'accepted_match') {
      return <Typography>Waiting for other player to accept</Typography>;
    }

    return (
      <>
        <MyButton
          onClick={this.startSearch}
          variant="contained"
          color="secondary"
          loading={this.state.loading}
        >
          Find match
        </MyButton>
        <Dialog
          open={this.state.postMatchOpen}
          onClose={() => this.setState({ postMatchOpen: false })}
        >
          <DialogTitle>Your match details</DialogTitle>
          <DialogContent>
            {this.renderOpponentDetails()}
            <Tooltip
              open={this.state.copied}
              disableFocusListener
              disableHoverListener
              disableTouchListener
              placement="top"
              title="Copied"
            >
              <CopyToClipboard
                text={this.state.opponent.id}
                onCopy={() => this.setState({copied: true})}
              >
                <TextField
                  label="Copy Steam ID to clipboard"
                  margin="normal"
                  variant="outlined"
                  value={this.state.opponent.id}
                />
              </CopyToClipboard>
            </Tooltip>
          </DialogContent>
        </Dialog>
      </>
    );
  }
}




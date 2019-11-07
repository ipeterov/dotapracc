import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import ReactTimeAgo from 'react-time-ago';
import autoBind from 'react-autobind';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { withSnackbar } from 'notistack';

import {
  Typography, Dialog, DialogActions, DialogContent, CircularProgress, Grid,
  DialogTitle, Table, TableBody, TableRow, TableCell, TextField, Tooltip,
} from '@material-ui/core';
import {CopyToClipboard} from 'react-copy-to-clipboard';

import MyButton from './MyButton.jsx';


class MatchFinder extends React.Component {
  constructor(props) {
    super(props);
    autoBind(this);

    this.state = {};

    const prefix = process.env.NODE_ENV === 'development' ? 'ws' : 'wss';
    this.sock = new W3CWebSocket(`${prefix}://${window.location.host}/ws/find_match`);

    this.steamIdInput = React.createRef();
  }

  componentDidMount() {
    this.sock.onmessage = (message) => {
      const newState = JSON.parse(message.data);
      newState.loading = false;
      newState.postMatchOpen = newState.state === 'finished';
      this.setState(newState);
    };
  }

  sendCommand(command) {
    return () => {
      this.setState({ loading: true }, () => {
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
          <TableRow>
            <TableCell align="left">Profile text</TableCell>
            <TableCell />
            <TableCell align="right">
              {this.state.opponent.profileText}
            </TableCell>
          </TableRow>
          {_.map(this.state.heroPairs, (heroPair) => {
              const [hero, matchup] = heroPair;
              return (
                <TableRow key={hero + matchup} >
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
    if (this.state.state === undefined) {
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
              onClick={this.sendCommand('cancel_search')}
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
                onClick={this.sendCommand('accept_match')}
                variant="contained"
                color="primary"
                loading={this.state.loading}
              >
                Accept
              </MyButton>
              <MyButton
                onClick={this.sendCommand('decline_match')}
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
          onClick={this.sendCommand('start_search')}
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
            <CopyToClipboard
              text={this.state.opponent.id}
              onCopy={() => {
                this.props.enqueueSnackbar('Copied');
                this.steamIdInput.select();
              }}
            >
              <TextField
                label="Copy Steam ID to clipboard"
                margin="normal"
                variant="outlined"
                value={this.state.opponent.id}
                inputRef={input => { this.steamIdInput = input}}
              />
            </CopyToClipboard>
          </DialogContent>
        </Dialog>
      </>
    );
  }
}

MatchFinder.propTypes = {
  enqueueSnackbar: PropTypes.func.isRequired,
};

export default withSnackbar(MatchFinder);

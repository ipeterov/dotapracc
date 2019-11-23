import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from '@apollo/react-hoc';
import { useQuery } from '@apollo/react-hooks';
import {
  Table, TableHead, TableBody, TableRow, TableCell, CircularProgress, Link,
  TextField, Typography, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions,
} from '@material-ui/core';

import MyButton from './MyButton';


const QUERY = gql`
  query Referrals { 
    viewer {
      id
      referralUrl
    }
    referrers {
      id
      personaname
      referralRegisters
      referralUrl
    }
  }
`;

const CREATE_REFERRAL_LINK = gql`
  mutation CreateReferralLink($code: String!) {
    createReferralLink(code: $code) {
      url
      error
    }
  }
`;


function Referrals({ mutate }) {
  const { loading, error, data } = useQuery(QUERY);
  const [linkCode, setLinkCode] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);

  if (loading || !!error) return <CircularProgress />;

  const renderUrl = (rawUrl) => {
    const url = new URL(rawUrl);
    const displayUrl = url.host + url.pathname.slice(0, -1);
    return (
      <Link href={rawUrl}>
        {displayUrl}
      </Link>
    );
  };

  const getReferralLink = () => {
    mutate({
      variables: {
        code: linkCode,
      },
      refetchQueries: [
        { query: QUERY },
      ],
    });
  };

  const renderUsersLink = (viewer) => {
    if (viewer.referralUrl) {
      return (
        <>
          <Typography>
            Here's your referral link: {renderUrl(viewer.referralUrl)}
          </Typography>
        </>
      );
    }

    return (
      <MyButton
        variant="outlined"
        onClick={() => { setDialogOpen(true); }}
      >
        Get my own referral link
      </MyButton>
    );
  };

  return (
    <>
      {renderUsersLink(data.viewer)}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              Referrer name
            </TableCell>
            <TableCell>
              Link
            </TableCell>
            <TableCell>
              Registrations
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {_.map(data.referrers, (item) => (
            <TableRow key={item.id}>
              <TableCell>
                {item.personaname}
              </TableCell>
              <TableCell>
                {renderUrl(item.referralUrl)}
              </TableCell>
              <TableCell>
                {item.referralRegisters}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); }}
        maxWidth="lg"
      >
        <DialogTitle>Refer my friends to the site</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Get a referral link and share it with your friends -
            if they register, you will enter the referrers leaderboard.
            Currently you're not getting anything but my gratitude and better
            matchmaking, but there will eventually be some rewards for
            referrers (like priority matching, ad revenue share,
            early previews, voting on features). We will use the referral code
            to for the URL.
          </DialogContentText>
          <TextField
            label="Make up your referral code"
            variant="standard"
            value={linkCode}
            onChange={({ target }) => { setLinkCode(target.value); }}
          />
        </DialogContent>
        <DialogActions>
          <MyButton onClick={() => { setDialogOpen(false); }} color="primary">
            Cancel
          </MyButton>
          <MyButton
            onClick={() => {
              getReferralLink();
              setDialogOpen(false);
            }}
            color="primary"
          >
            Get my own referral link
          </MyButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

Referrals.propTypes = {
  mutate: PropTypes.func.isRequired,
};

export default graphql(CREATE_REFERRAL_LINK)(Referrals);

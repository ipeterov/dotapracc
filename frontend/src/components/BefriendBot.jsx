import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from '@apollo/react-hoc';
import {
  Button,
  Grid,
  Typography,
} from '@material-ui/core';


const BEFRIEND_BOT = gql`
  mutation BefriendBot{
    befriendBot{ error }
  }
`;

function BefriendBot({ mutate, toNextStep }) {
  const [inProgress, setInProgress] = React.useState(false);

  const befriendBot = () => {
    setInProgress(true);
    mutate().then(() => {
      setInProgress(false);
      if (toNextStep !== null) toNextStep();
    });
  };

  return (
    <>
      <Typography>
        While the site is relatively small, we will have to notify others
        when you try to find a match
      </Typography>
      <Grid
        container
        spacing={1}
      >
        <Grid item>
          <Button
            variant="contained"
            color="secondary"
            onClick={befriendBot}
            disabled={inProgress}
          >
            {inProgress ? 'Accept the friend request to proceed' : 'Send request'}
          </Button>
        </Grid>
        {toNextStep !== null && (
          <Grid item>
            <Button
              variant="outlined"
              onClick={toNextStep}
            >
              Skip
            </Button>
          </Grid>
        )}
      </Grid>
    </>
  );
}

BefriendBot.defaultProps = {
  toNextStep: null,
};

BefriendBot.propTypes = {
  mutate: PropTypes.func.isRequired,
  toNextStep: PropTypes.func,
};

export default graphql(BEFRIEND_BOT)(BefriendBot);

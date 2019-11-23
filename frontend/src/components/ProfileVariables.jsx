import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from '@apollo/react-hoc';
import { compose } from 'recompose';
import gql from 'graphql-tag';
import { TextField, Typography } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';


const PROFILE_FRAGMENT = gql`
  fragment profile on UserType {
      __typename
      id
      profileText
  }
`;

const QUERY = gql`
  query Profile { 
    viewer {
      ...profile
    } 
  }
  ${PROFILE_FRAGMENT}
`;

const UPDATE_VIEWER_PROFILE = gql`
  mutation UpdateViewerProfile($profileText: String) {
    updateViewerProfile(profileText: $profileText) {
      viewer {
        ...profile
      }
    }
  }
  ${PROFILE_FRAGMENT}
`;


class ProfileVariables extends React.Component {
  handleChange(fieldName) {
    return (event) => {
      const viewer = _.cloneDeep(this.props.data.viewer);
      const value = event.target.value;
      viewer[fieldName] = value;
      this.props.mutate({
        variables: { [fieldName]: value },
        optimisticResponse: {
          __typename: 'Mutation',
          updateViewerProfile: {
            __typename: 'updateViewerProfile',
            viewer,
          },
        },
      });
    };
  }

  render() {
    const { data } = this.props;
    const { loading, error } = data;

    if (error) return <p>Error :(</p>;

    if (!loading && data.viewer == null) {
      return (
        <Typography>
          Log in to be able to configure your profile.
        </Typography>
      );
    }

    if (loading) return <Skeleton variant="rect" height={48} />;

    return (
      <TextField
        label="Your profile message (will be shown to the opponent when a match is found)"
        onChange={this.handleChange('profileText')}
        value={data.viewer.profileText}
        fullWidth
        placeholder="Bounty gold, no block, to one death. Preferred match length - under 5 minutes"
        InputLabelProps={{ shrink: true }}
      />
    );
  }
}

ProfileVariables.propTypes = {
  mutate: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
};

export default compose(
  graphql(QUERY),
  graphql(UPDATE_VIEWER_PROFILE),
)(ProfileVariables);

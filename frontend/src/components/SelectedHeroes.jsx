import _ from 'lodash';
import React from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import { graphql } from '@apollo/react-hoc';
import { compose } from 'recompose';
import gql from 'graphql-tag';
import {
  Button,
  CircularProgress,
  Grid,
  Typography,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

import SelectedHero, {
  SELECTED_HERO_FRAGMENT,
  UPDATE_OR_CREATE_SELECTED_HERO,
} from './SelectedHero';
import AddHeroDialog from './AddHeroDialog';


const QUERY = gql`
  query Base { 
    viewer {
      id
      personaname
      selectedHeroes { ...selectedHero }
    } 
    allHeroes {
      id
      name
      pictureThumbnail
      primaryAttribute
    }
    midlaners { id }
  }
  ${SELECTED_HERO_FRAGMENT}
`;

const DELETE_SELECTED_HERO = gql`
  mutation DeleteSelectedHero($selectedHeroId: ID) {
    deleteSelectedHero(selectedHeroId: $selectedHeroId) { ok }
  }
`;

const TOGGLE_SELECTED_HEROES = gql`
  mutation ToggleSelectedHeroes($toggleTo: Boolean) {
    toggleSelectedHeroes(toggleTo: $toggleTo) { ok }
  }
`;


class SelectedHeroes extends React.Component {
  constructor(props) {
    super(props);
    autoBind(this);

    this.state = {
      added: [],
      adding: false,
      deleting: [],
    };
  }

  handleAdd(heroId) {
    this.setState({ adding: true },
      () => {
        this.props.updateOrCreate({
          variables: { heroId },
          refetchQueries: [{ query: QUERY }],
          awaitRefetchQueries: true,
        }).then(() => {
          // eslint-disable-next-line react/no-access-state-in-setstate
          const added = [heroId].concat(this.state.added);
          this.setState({ adding: false, added });
        });
      });
  }

  handleDelete(selectedHeroId) {
    this.setState(
      (prevState) => ({ deleting: prevState.deleting.concat([selectedHeroId]) }),
      () => {
        this.props.delete({
          variables: {
            selectedHeroId,
          },
          refetchQueries: [
            { query: QUERY },
          ],
        }).then(() => {
          const newDeleting = _.filter(
            // eslint-disable-next-line react/no-access-state-in-setstate
            this.state.deleting,
            (id) => id !== selectedHeroId,
          );
          this.setState({ deleting: newDeleting });
        });
      },
    );
  }

  handleToggleSelectedHeroes(toggleTo) {
    this.props.toggleSelectedHeroes({
      variables: { toggleTo },
      refetchQueries: [
        { query: QUERY },
      ],
    });
  }

  renderSelectedHeroes(data) {
    return (
      <>
        {
          data.viewer.selectedHeroes.length === 0 && (
            <Grid item xs={12}>
              <Typography>
                You don't have any heroes selected. To be able to find a match,
                add a few heroes.
              </Typography>
            </Grid>
          )
        }
        {
          this.state.adding && (
            <Grid item xs={12}>
              <Grid container justify="center">
                <CircularProgress />
              </Grid>
            </Grid>
          )
        }
        {
          data.viewer.selectedHeroes.map((selectedHero) => (
            <SelectedHero
              selectedHero={selectedHero}
              allHeroes={data.allHeroes}
              midlaners={data.midlaners}
              handleDelete={this.handleDelete}
              deleting={this.state.deleting.includes(selectedHero.id)}
              justAdded={this.state.added.includes(selectedHero.hero.id)}
              key={selectedHero.id + this.state.added.includes(selectedHero.hero.id)}
            />
          ))
        }
      </>
    );
  }

  static renderSkeletons() {
    return _.times(3, (i) => (
      <Grid key={i} item style={{ width: '100%' }}>
        <Skeleton variant="rect" height={180.5} />
      </Grid>
    ));
  }

  render() {
    const { data, showProfileLink } = this.props;
    const { loading, error } = data;

    let zeroHeroesSelected;
    if (loading || !data.viewer) {
      zeroHeroesSelected = false;
    } else {
      zeroHeroesSelected = data.viewer.selectedHeroes.length === 0;
    }

    if (error) return <p>Error :(</p>;

    if (!loading && data.viewer == null) {
      return (
        <Typography>
          Sign in through Steam to be able to train heroes.
        </Typography>
      );
    }

    return (
      <Grid container spacing={2} direction="column">
        <Grid item>
          <Grid container spacing={1}>
            {showProfileLink && !zeroHeroesSelected && (
              <Grid item>
                <Button
                  variant="contained"
                  color="secondary"
                  href="/"
                >
                  To my profile
                </Button>
              </Grid>
            )}
            <Grid item>
              <AddHeroDialog
                zeroHeroesSelected={zeroHeroesSelected}
                disabled={loading}
                handleAdd={this.handleAdd}
                allHeroes={data.allHeroes || []}
              />
            </Grid>
            {!zeroHeroesSelected && (
              <>
                <Grid item>
                  <Button
                    onClick={() => this.handleToggleSelectedHeroes(true)}
                    disabled={loading}
                  >
                    Switch all heroes on
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    onClick={() => this.handleToggleSelectedHeroes(false)}
                    disabled={loading}
                  >
                    Switch all heroes off
                  </Button>
                </Grid>
              </>
            )}
          </Grid>
        </Grid>
        <Grid item>
          <Grid container spacing={2}>
            {loading ? SelectedHeroes.renderSkeletons() : this.renderSelectedHeroes(data)}
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

SelectedHeroes.defaultProps = {
  showProfileLink: false,
};

SelectedHeroes.propTypes = {
  delete: PropTypes.func.isRequired,
  updateOrCreate: PropTypes.func.isRequired,
  toggleSelectedHeroes: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
  showProfileLink: PropTypes.bool,
};

export default compose(
  graphql(QUERY),
  graphql(DELETE_SELECTED_HERO, { name: 'delete' }),
  graphql(UPDATE_OR_CREATE_SELECTED_HERO, { name: 'updateOrCreate' }),
  graphql(TOGGLE_SELECTED_HEROES, { name: 'toggleSelectedHeroes' }),
)(SelectedHeroes);

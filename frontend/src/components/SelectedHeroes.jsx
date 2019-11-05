import _ from 'lodash';
import React from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import { graphql } from '@apollo/react-hoc';
import { compose } from 'recompose';
import gql from 'graphql-tag'

import { Grid, CircularProgress, Typography } from "@material-ui/core";

import SelectedHero, {
  SELECTED_HERO_FRAGMENT, UPDATE_OR_CREATE_SELECTED_HERO,
} from "./SelectedHero.jsx";
import AddHeroDialog from './AddHeroDialog.jsx';


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
      picture
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


class SelectedHeroes extends React.Component {
  constructor(props) {
    super(props);
    autoBind(this);

    this.state = {
      adding: false,
      deleting: [],
    };
  }

  handleAdd(heroId) {
    this.setState({ adding: true },
      () => {
        this.props.updateOrCreate({
          variables: {
            heroId,
            matchupIds: [],
          },
          refetchQueries: [
            { query: QUERY },
          ],
          awaitRefetchQueries: true,
        }).then(() => {
          this.setState({ adding: false });
        });
      }
    );
  }

  handleDelete(selectedHeroId) {
    this.setState(
      {deleting: this.state.deleting.concat([selectedHeroId])},
      () => {
        this.props.delete({
          variables: {
            selectedHeroId: selectedHeroId
          },
          refetchQueries: [
            { query: QUERY }
          ]
        }).then(() => {
          const newDeleting = _.filter(
            this.state.deleting,
            id => id !== selectedHeroId,
          );
          this.setState({ deleting: newDeleting });
        });
      },
    );
  }

  render() {
    const { data } = this.props;
    const { loading, error } = data;

    if (error) return <p>Error :(</p>;
    if (loading) return (
      <Grid container justify="center">
        <CircularProgress />
      </Grid>
    );

    if (data.viewer == null) return (
      <Typography>
        Log in to be able to configure your profile.
      </Typography>
    );

    return (
      <Grid container spacing={2}>
        <Grid item>
          <AddHeroDialog
            handleAdd={this.handleAdd}
            allHeroes={data.allHeroes}
          />
        </Grid>
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
          data.viewer.selectedHeroes.map((selectedHero) => (
            <SelectedHero
              selectedHero={selectedHero}
              allHeroes={data.allHeroes}
              midlaners={data.midlaners}
              handleDelete={this.handleDelete}
              deleting={this.state.deleting.includes(selectedHero.id)}
              key={selectedHero.id}
            />
          ))
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
      </Grid>
    );
  }
}

SelectedHeroes.propTypes = {
  delete: PropTypes.func.isRequired,
  updateOrCreate: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
};

export default compose(
  graphql(QUERY),
  graphql(DELETE_SELECTED_HERO, {name: 'delete'}),
  graphql(UPDATE_OR_CREATE_SELECTED_HERO, {name: 'updateOrCreate'}),
)(SelectedHeroes);
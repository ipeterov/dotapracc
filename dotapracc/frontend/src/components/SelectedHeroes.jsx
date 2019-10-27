import React from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import { graphql } from '@apollo/react-hoc';
import { compose } from 'recompose';
import gql from 'graphql-tag'

import { Grid, CircularProgress } from "@material-ui/core";

import SelectedHero, {
  SELECTED_HERO_FRAGMENT, UPDATE_OR_CREATE_SELECTED_HERO,
} from "./SelectedHero.jsx";
import AddHeroDialog from './AddHeroDialog.jsx';


const QUERY = gql`
  query Base { 
    viewer {
      id
      username
      selectedHeroes { ...selectedHero }
    } 
    allHeroes {
      id
      name
      picture
      primaryAttribute
    }
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
  }

  handleAdd(heroId) {
    this.props.updateOrCreate({
      variables: {
        heroId,
        matchupIds: [],
      },
      refetchQueries: [
        { query: QUERY }
      ]
    });
  }

  handleDelete(selectedHeroId) {
    this.props.delete({
      variables: {
        selectedHeroId: selectedHeroId
      },
      refetchQueries: [
        { query: QUERY }
      ]
    });
  }

  render() {
    const { data } = this.props;
    const { loading, error } = data;

    if (error) return <p>Error :(</p>;
    if (loading) return <CircularProgress />;

    return (
      <Grid container spacing={2}>
        <Grid item>
          <AddHeroDialog
            handleAdd={this.handleAdd}
            allHeroes={data.allHeroes}
          />
        </Grid>
        {
          data.viewer.selectedHeroes.map((selectedHero) => (
            <SelectedHero
              selectedHero={selectedHero}
              allHeroes={data.allHeroes}
              handleDelete={this.handleDelete}
              key={selectedHero.id}
            />
          ))
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

import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from "@material-ui/core";

import SelectedHero from "./SelectedHero.jsx";


export default class SelectedHeroes extends React.Component {
  render() {
    return (
      <Grid container spacing={2}>
        {this.props.selectedHeroes.map((selectedHero) => (
          <SelectedHero
            selectedHero={selectedHero}
            key={selectedHero.id}
          />
        ))}
      </Grid>
    );
  }
}

SelectedHeroes.propTypes = {
  selectedHeroes: PropTypes.array.isRequired,
};

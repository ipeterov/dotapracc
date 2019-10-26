import React from 'react';
import PropTypes from 'prop-types';
import {
  Card, CardActions, CardContent, Typography, Button, Checkbox, FormControl,
  InputLabel, FormHelperText, Grid, FormControlLabel, FormGroup,
} from "@material-ui/core";

import HeroChipList from "./HeroChipList.jsx";


export default class SelectedHero extends React.Component {
  render() {
    const selectedHero = this.props.selectedHero;
    const hero = selectedHero.hero;

    return (
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {hero.name}
            </Typography>

            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={selectedHero.addAllMids} />}
                label={`Add all mid heroes`}
              />

              <FormControlLabel
                control={<Checkbox checked={selectedHero.addCounters} />}
                label={`Add counters - ${hero.counters.map(h => h.name).join(', ')}`}
              />

              <FormControlLabel
                control={<Checkbox checked={selectedHero.addEasyLanes} />}
                label={`Add easy lanes - ${hero.easyLanes.map(h => h.name).join(', ')}`}
              />
            </FormGroup>
          </CardContent>
        </Card>
      </Grid>
    );
  }
}

SelectedHero.propTypes = {
  selectedHero: PropTypes.object.isRequired,
};

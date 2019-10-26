import React from 'react';
import PropTypes from 'prop-types';
import { Chip } from "@material-ui/core";


export default function HeroChipList(props) {
  return props.heroes.map((m) => (
    <Chip
      key={m.id}
      label={m.name}
      variant="outlined"
      size="small"
    />
  ));
}

HeroChipList.propTypes = {
  heroes: PropTypes.array.isRequired,
};

import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from '@apollo/react-hoc';
import gql from 'graphql-tag';

import {
  Card, CardContent, Grid, GridList, GridListTile, CardHeader, Avatar,
  IconButton, Typography, CircularProgress, Button, ButtonGroup,
} from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';


export const SELECTED_HERO_FRAGMENT = gql`
  fragment selectedHero on SelectedHeroType {
    __typename
    id
    matchups { __typename id }
    hero {
      __typename
      id
      name
      picture
      primaryAttribute
      attackType
      counters { __typename id }
      easyLanes { __typename id }
    }
  }
`;

export const UPDATE_OR_CREATE_SELECTED_HERO = gql`
  mutation UpdateOrCreateSelectedHero(
    $heroId: ID,
    $matchupIds: [ID],
  ) {
    updateOrCreateSelectedHero(
      heroId: $heroId,
      matchupIds: $matchupIds,
    ) {
      selectedHero { ...selectedHero }
    }
  }
  ${SELECTED_HERO_FRAGMENT}
`;


class SelectedHero extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      highlightedHeroId: null
    };
  }

  getIdArray(matchups) {
    const matchupArray = [];
    matchups.forEach(matchupDict => {
      matchupArray.push(matchupDict.id);
    });
    return matchupArray;
  }

  getHeroesByAttr(heroes) {
    const heroesByAttr = { STRENGTH: [], AGILITY: [], INTELLECT: [] };
    heroes.forEach(hero => {
      heroesByAttr[hero.primaryAttribute].push(hero);
    });
    ['STRENGTH', 'AGILITY', 'INTELLECT'].forEach(attr => {
      heroesByAttr[attr] = _.sortBy(heroesByAttr[attr], ['name'])
    });
    return heroesByAttr;
  }

  getGreyscaleStyle(heroId, matchups) {
    const highlighted = this.state.highlightedHeroId === heroId;
    let greyscalePercent;
    if (matchups.includes(heroId)) {
      greyscalePercent = highlighted ? 25: 0;
    } else {
      greyscalePercent = highlighted ? 75: 100;
    }
    return { filter: `grayscale(${greyscalePercent}%)` }
  }

  setHeroes(selectedHeroOriginal, heroIds) {
    const selectedHero = _.cloneDeep(selectedHeroOriginal);

    selectedHero.matchups = heroIds.map(
      heroId => ({ id: heroId, __typename: 'HeroType' })
    );

    this.props.mutate({
      variables: {
        heroId: selectedHero.hero.id,
        matchupIds: heroIds,
      },
      optimisticResponse: {
        __typename: 'Mutation',
        updateOrCreateSelectedHero: {
          __typename: 'UpdateOrCreateSelectedHero',
          selectedHero,
        }
      }
    });
  }

  toggleHeroes(heroIds) {
    return () => {
      const matchups = this.getIdArray(this.props.selectedHero.matchups);

      let newMatchups;
      if (_.difference(heroIds, matchups).length) {
        newMatchups = _.union(matchups, heroIds);
      } else {
        newMatchups = _.difference(matchups, heroIds);
      }

      this.setHeroes(this.props.selectedHero, newMatchups);
    };
  }

  render() {
    const { selectedHero, allHeroes } = this.props;
    const { primaryAttribute, attackType, name } = selectedHero.hero;

    const matchups = this.getIdArray(selectedHero.matchups);
    const midlaners = this.getIdArray(this.props.midlaners);
    const counters = this.getIdArray(selectedHero.hero.counters);
    const easyLanes = this.getIdArray(selectedHero.hero.easyLanes);

    const heroesByAttr = this.getHeroesByAttr(allHeroes);

    return (
      <Grid item xs={12}>
        <Card>
          <CardHeader
            avatar={
              <Avatar
                src={'media/' + selectedHero.hero.picture}
                style={{ width: '80px', height: '80px' }}
              />
            }
            action={
              <div>
                <IconButton onClick={
                  () => this.props.handleDelete(selectedHero.id)
                }>
                  {this.props.deleting ?
                    <CircularProgress size={24} /> : <CloseIcon />
                  }
                </IconButton>
              </div>
            }
            title={name}
            titleTypographyProps={{ variant: 'h5' }}
            subheader={`${primaryAttribute}, ${attackType}`}
          />

          <CardContent>
            <Typography variant={'overline'}>
              Will match with:
            </Typography>
            {['STRENGTH', 'AGILITY', 'INTELLECT'].map(attribute => (
              <GridList
                key={attribute}
                spacing={1}
                cols={15}
                cellHeight={44}
                style={{ marginBottom: '8px' }}
              >
                {heroesByAttr[attribute].map(hero => (
                  <GridListTile
                    key={hero.picture}
                    onMouseDown={this.toggleHeroes([hero.id])}
                    onMouseEnter={() => this.setState({ highlightedHeroId: hero.id })}
                    onMouseLeave={() => this.setState({ highlightedHeroId: null })}
                  >
                    <img
                      src={'media/' + hero.picture}
                      alt={hero.name}
                      style={this.getGreyscaleStyle(hero.id, matchups)}
                    />
                  </GridListTile>
                ))}
              </GridList>
            ))}
            <Grid container justify="center">
              <ButtonGroup variant="text" size="medium">
                <Button onClick={this.toggleHeroes(midlaners)}>
                  Toggle all mids
                </Button>
                <Button onClick={this.toggleHeroes(counters)}>
                  Toggle counters
                </Button>
                <Button onClick={this.toggleHeroes(easyLanes)}>
                  Toggle easy lanes
                </Button>
              </ButtonGroup>
              <ButtonGroup variant="text" size="medium">
                <Button onClick={() => {
                  const ids = this.getIdArray(allHeroes);
                  this.setHeroes(selectedHero,ids)}
                }>
                  Add all
                </Button>
                <Button onClick={() => {this.setHeroes(selectedHero,[])}}>
                  Clear
                </Button>
              </ButtonGroup>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    );
  }
}

SelectedHero.propTypes = {
  selectedHero: PropTypes.object.isRequired,
  allHeroes: PropTypes.array.isRequired,
  midlaners: PropTypes.array.isRequired,
  mutate: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  deleting: PropTypes.bool.isRequired,
};

export default graphql(UPDATE_OR_CREATE_SELECTED_HERO)(SelectedHero)

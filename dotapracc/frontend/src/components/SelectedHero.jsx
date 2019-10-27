import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from '@apollo/react-hoc';
import gql from 'graphql-tag';

import {
  Card, CardContent, Grid, GridList, GridListTile, CardHeader, Avatar,
  IconButton, Typography, CircularProgress,
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

const STR = 'STR';
const AGI = 'AGI';
const INT = 'INT';


class SelectedHero extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      highlightedHeroId: null
    };
  }

  getMatchupArray(matchups) {
    const matchupArray = [];
    matchups.forEach(matchupDict => {
      matchupArray.push(matchupDict.id);
    });
    return matchupArray;
  }

  handleHeroClick(heroId) {
    return () => {
      const selectedHero = _.cloneDeep(this.props.selectedHero);

      if (selectedHero.matchups.some(elem => elem.id === heroId)) {
        _.remove(selectedHero.matchups, elem => elem.id === heroId);
      } else {
        selectedHero.matchups.push({ id: heroId, __typename: 'HeroType' });
      }

        this.props.mutate({
          variables: {
            heroId: selectedHero.hero.id,
            matchupIds: this.getMatchupArray(selectedHero.matchups),
          },
          optimisticResponse: {
            __typename: 'Mutation',
            updateOrCreateSelectedHero: {
              __typename: 'UpdateOrCreateSelectedHero',
              selectedHero,
            }
          }
        });
    };
  }

  getGreyscaleStyle(heroId, matchups) {
    const highlighted = this.state.highlightedHeroId === heroId;
    let greyscalePercent;
    if (matchups.includes(heroId)) {
      greyscalePercent = highlighted ? 30: 0;
    } else {
      greyscalePercent = highlighted ? 70: 100;
    }
    return { filter: `grayscale(${greyscalePercent}%)` }
  }

  render() {
    const { selectedHero, allHeroes } = this.props;
    const { id, primaryAttribute, attackType, name } = selectedHero.hero;

    const heroesByAttr = { STR: [], AGI: [], INT: [] };
    allHeroes.forEach(hero => {
      heroesByAttr[hero.primaryAttribute].push(hero);
    });
    [STR, AGI, INT].forEach(attr => {
      heroesByAttr[attr] = _.sortBy(heroesByAttr[attr], ['name'])
    });

    const matchups = this.getMatchupArray(selectedHero.matchups);

    return (
      <Grid item xs={12}>
        <Card>
          <CardHeader
            avatar={
              <Avatar
                src={'media/' + selectedHero.hero.picture}
                style={{ width: '60px', height: '60px' }}
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
            {[STR, AGI, INT].map(attribute => (
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
                    onMouseDown={this.handleHeroClick(hero.id)}
                    onMouseEnter={() => this.setState({highlightedHeroId: hero.id})}
                    onMouseLeave={() => this.setState({highlightedHeroId: null})}
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
          </CardContent>
        </Card>
      </Grid>
    );
  }
}

SelectedHero.propTypes = {
  selectedHero: PropTypes.object.isRequired,
  allHeroes: PropTypes.array.isRequired,
  mutate: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  deleting: PropTypes.bool.isRequired,
};

export default graphql(UPDATE_OR_CREATE_SELECTED_HERO)(SelectedHero)

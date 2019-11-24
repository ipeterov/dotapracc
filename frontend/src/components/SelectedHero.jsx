import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from '@apollo/react-hoc';
import gql from 'graphql-tag';
import {
  Avatar,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Grid,
  GridList,
  GridListTile,
  IconButton,
  Switch,
  Tooltip,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';


export const SELECTED_HERO_FRAGMENT = gql`
  fragment selectedHero on SelectedHeroType {
    __typename
    id
    isSwitchedOn
    matchups { __typename id }
    hero {
      __typename
      id
      name
      picture
      primaryAttribute
      attackType
      proMatchups { __typename id }
    }
  }
`;

export const UPDATE_OR_CREATE_SELECTED_HERO = gql`
  mutation UpdateSelectedHero(
    $heroId: ID!,
    $matchupIds: [ID],
    $isSwitchedOn: Boolean,
  ) {
    updateOrCreateSelectedHero(
      heroId: $heroId,
      matchupIds: $matchupIds,
      isSwitchedOn: $isSwitchedOn,
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
      highlightedHeroId: null,
      matchupsExpanded: props.justAdded,
    };
  }

  static getIdArray(matchups) {
    const matchupArray = [];
    matchups.forEach((matchupDict) => {
      matchupArray.push(matchupDict.id);
    });
    return matchupArray;
  }

  static getHeroesByAttr(heroes) {
    const heroesByAttr = { STRENGTH: [], AGILITY: [], INTELLECT: [] };
    heroes.forEach((hero) => {
      heroesByAttr[hero.primaryAttribute].push(hero);
    });
    ['STRENGTH', 'AGILITY', 'INTELLECT'].forEach((attr) => {
      heroesByAttr[attr] = _.sortBy(heroesByAttr[attr], ['name']);
    });
    return heroesByAttr;
  }

  getGreyscaleStyle(heroId, matchups) {
    const highlighted = this.state.highlightedHeroId === heroId;
    let greyscalePercent;
    if (matchups.includes(heroId)) {
      greyscalePercent = highlighted ? 25 : 0;
    } else {
      greyscalePercent = highlighted ? 75 : 100;
    }
    return { filter: `grayscale(${greyscalePercent}%)` };
  }

  update(updates) {
    const selectedHero = _.cloneDeep(this.props.selectedHero);
    const variables = { heroId: selectedHero.hero.id };

    if ('heroIds' in updates) {
      selectedHero.matchups = updates.heroIds.map(
        (heroId) => ({ id: heroId, __typename: 'HeroType' }),
      );
      variables.matchupIds = updates.heroIds;
    }

    if ('isSwitchedOn' in updates) {
      selectedHero.isSwitchedOn = updates.isSwitchedOn;
      variables.isSwitchedOn = updates.isSwitchedOn;
    }

    this.props.mutate({
      variables,
      optimisticResponse: {
        __typename: 'Mutation',
        updateOrCreateSelectedHero: {
          __typename: 'UpdateOrCreateSelectedHero',
          selectedHero,
        },
      },
    });
  }

  toggleHeroes(heroIds) {
    return () => {
      const matchups = SelectedHero.getIdArray(this.props.selectedHero.matchups);

      let newMatchups;
      if (_.difference(heroIds, matchups).length) {
        newMatchups = _.union(matchups, heroIds);
      } else {
        newMatchups = _.difference(matchups, heroIds);
      }

      this.update({ heroIds: newMatchups });
    };
  }

  render() {
    const { selectedHero, allHeroes } = this.props;
    const { primaryAttribute, attackType, name } = selectedHero.hero;

    const matchups = SelectedHero.getIdArray(selectedHero.matchups);
    const midlaners = SelectedHero.getIdArray(this.props.midlaners);
    const proMatchups = SelectedHero.getIdArray(selectedHero.hero.proMatchups);

    const heroesByAttr = SelectedHero.getHeroesByAttr(allHeroes);

    return (
      <Grid item xs={12}>
        <Card>
          <CardHeader
            avatar={(
              <Avatar
                variant="rounded"
                src={selectedHero.hero.picture}
                style={{
                  width: '128px',
                  height: '72px',
                  filter: `grayscale(${selectedHero.isSwitchedOn ? 0 : 100}%)`,
                }}
              />
            )}
            action={(
              <>
                <Tooltip title="Switch heroes off to temporarily disable them">
                  <Switch
                    color="primary"
                    checked={selectedHero.isSwitchedOn}
                    onChange={(event) => {
                      this.update({ isSwitchedOn: event.target.checked });
                    }}
                  />
                </Tooltip>
                <IconButton onClick={
                  () => this.props.handleDelete(selectedHero.id)
                }
                >
                  {this.props.deleting ?
                    <CircularProgress size={24} /> : <CloseIcon />
                  }
                </IconButton>
              </>
            )}
            title={name}
            titleTypographyProps={{ variant: 'h5' }}
            subheader={`${primaryAttribute}, ${attackType}`}
          />

          <CardContent>
            <Grid
              container
              justify="space-between"
              alignItems="center"
            >
              <Grid item>
                {this.state.matchupsExpanded ? (
                  <Typography variant="overline">
                    Will match with:
                  </Typography>
                ) : (
                  <Typography variant="overline">
                    {matchups.length} matchups configured
                  </Typography>
                )}
              </Grid>

              <Grid item>
                <Button
                  onClick={() => this.setState((prevState) => (
                    { matchupsExpanded: !prevState.matchupsExpanded }
                  ))}
                >
                  {
                    this.state.matchupsExpanded ?
                      'Hide matchups' :
                      `Configure matchups for ${name}`
                  }
                </Button>
              </Grid>
            </Grid>
            {this.state.matchupsExpanded &&
              ['STRENGTH', 'AGILITY', 'INTELLECT'].map((attribute) => (
                <GridList
                  key={attribute}
                  spacing={1}
                  cols={15}
                  cellHeight={44}
                  style={{ marginBottom: '8px' }}
                >
                  {heroesByAttr[attribute].map((hero) => (
                    <GridListTile
                      key={hero.id}
                      onMouseDown={this.toggleHeroes([hero.id])}
                      onMouseEnter={() => this.setState({ highlightedHeroId: hero.id })}
                      onMouseLeave={() => this.setState({ highlightedHeroId: null })}
                    >
                      <img
                        src={hero.pictureThumbnail}
                        alt={hero.name}
                        style={this.getGreyscaleStyle(hero.id, matchups)}
                      />
                    </GridListTile>
                  ))}
                </GridList>
              ))
            }
            {this.state.matchupsExpanded && (
              <Grid container justify="center">
                <ButtonGroup variant="text" size="medium">
                  <Button onClick={() => {
                    this.update({ heroIds: SelectedHero.getIdArray(allHeroes) });
                  }}
                  >
                    Select all
                  </Button>
                  <Tooltip title="Using OpenDota hero lane presences">
                    <Button onClick={() => {
                      this.update({ heroIds: midlaners });
                    }}
                    >
                      Select all mids
                    </Button>
                  </Tooltip>
                  <Tooltip title="Where there is at least one pro match with this matchup">
                    <Button onClick={() => {
                      this.update({ heroIds: proMatchups });
                    }}
                    >
                      Select pro matchups
                    </Button>
                  </Tooltip>
                  <Button onClick={() => {
                    this.update({ heroIds: [] });
                  }}
                  >
                    Clear
                  </Button>
                </ButtonGroup>
              </Grid>
            )}
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
  justAdded: PropTypes.bool.isRequired,
};

export default graphql(UPDATE_OR_CREATE_SELECTED_HERO)(SelectedHero);

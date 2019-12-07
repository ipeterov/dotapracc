import React from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Typography,
} from '@material-ui/core';


export default function About() {
  return (
    <Grid
      container
      direction="column"
      spacing={6}
    >
      <Grid
        item
        container
        spacing={1}
        direction="column"
        // style={{ marginTop: 100 }}
      >
        <Grid item>
          <Typography variant="h2" style={{ whiteSpace: 'pre-line' }}>
            Matchmaking platform{'\n'}
            for 1v1 practice
          </Typography>
        </Grid>

        <Grid item>
          <Typography variant="body1">
            Sign up with Steam and start practicing in less than a minute
          </Typography>
        </Grid>

        <Grid item>
          <Button
            size="large"
            variant="contained"
            color="secondary"
            href="/wizard"
          >
            Start practicing
          </Button>
        </Grid>
      </Grid>
      <Divider />
      <Grid
        item
        container
        spacing={2}
      >
        <Grid item xs={3}>
          <Card>
            <CardHeader
              style={{ paddingBottom: 0 }}
              title="What is dotapra.cc?"
            />
            <CardContent>
              <Typography>
                It's a site for finding 1v1 practice partners in Dota 2
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={3}>
          <Card>
            <CardHeader
              style={{ paddingBottom: 0 }}
              title="How does it work?"
            />
            <CardContent>
              <Typography>
                Press "Find match". When a match is found, a dotapra.cc bot will
                invite you to a lobby, where you can play as many games as you
                want with your opponent
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={3}>
          <Card>
            <CardHeader
              style={{ paddingBottom: 0 }}
              title="Why not just queue 1v1 in dota?"
            />
            <CardContent>
              <Typography>
                dotapra.cc knows what heroes you want to play and won't get
                you irrelevant matches. Also, you don't have to communicate that
                you want to play more games with the same person - it's the
                default here!
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={3}>
          <Card>
            <CardHeader
              style={{ paddingBottom: 0 }}
              title="I want to suggest a feature / report a bug"
            />
            <CardContent>
              <Typography>
                You can either create an issue on GitHub or discuss it on
                dotapra.cc discord. I listen to all available feedback and
                respond to every message
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Grid>
  );
}

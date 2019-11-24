import React from 'react';
import { Grid, Typography } from '@material-ui/core';


export default function About() {
  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <Typography variant="h5">What is dotapra.cc?</Typography>
        <Typography>
          It's a site for finding 1v1 practice partners in Dota 2.
        </Typography>
      </Grid>

      <Grid item>
        <Typography variant="h5">How does it work?</Typography>
        <Typography>
          Press "Find match". When a match is found, a dotapra.cc bot will
          invite you to a lobby, where you can play as many games as you want
          with your opponent.
        </Typography>
      </Grid>

      <Grid item>
        <Typography variant="h5">How to set it up?</Typography>
        <Typography>
          1. Sign in via Steam
        </Typography>
        <Typography>
          2. Add heroes that you want to practice (and against which heroes)
        </Typography>
        <Typography>
          3. (optional) Write a short message to people who will get matched
          with you. Probably a good idea to describe the rules you want.
        </Typography>
      </Grid>

      <Grid item>
        <Typography variant="h5">Why not just queue 1v1 in dota?</Typography>
        <Typography>
          • You will get people who just want to play SF vs SF when you wanna
          improve your tinker laning, and vice versa. You don't just have to
          wait for a match, you will sometimes have to tank an abandon. On
          dotapra.cc you can set what heroes you want to practice and will
          only get matches with whom you have hero pairs.
        </Typography>
        <Typography>
          • You match with someone only for one game. If you want to have a
          proper practice session, you will have to invite them after the game
          yourself. If you're lucky and they don't leave the after-game chat.
        </Typography>
      </Grid>

      <Grid item>
        <Typography variant="h5">I want to suggest a feature / report a bug</Typography>
        <Typography>
          You can either create an issue on GitHub or discuss it on dotapra.cc
          discord. I listen to all available feedback and respond to every
          message.
        </Typography>
      </Grid>
    </Grid>
  );
}

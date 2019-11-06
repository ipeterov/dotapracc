import React from 'react';

import { Typography } from "@material-ui/core";


export default function About() {
  return (
    <>
      <Typography variant="h5">What is dotapra.cc?</Typography>
      <Typography>It's a site for finding 1v1 practice partners in Dota 2.</Typography>

      <Typography variant="h5">How does it work?</Typography>
      <Typography>
        1. Sign in via Steam
      </Typography>
      <Typography>
        2. Add heroes that you want to practice (and against which heroes)
      </Typography>
      <Typography>
        3. Press "Find match"
      </Typography>
      <Typography>
        4. dotapra.cc matches you with a partner and gives you his/her steam ID
      </Typography>
      <Typography>
        5. You invite him/her to a dota 2 party and play as much as you want
      </Typography>
      <Typography>
        6. Whenever you feel like practicing your mid laning, GOTO step 3
      </Typography>
    </>
  );
}

import React  from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord, faGithub } from '@fortawesome/free-brands-svg-icons'
import { AppBar, Grid, Button } from '@material-ui/core';


export default function Footer() {
  return (
    <AppBar
      style={{
        bottom: '-8px',
        margin: '0 -8px',
        width: 'calc(100% + 16px)',
        height: '100px',
      }}
      position="relative"
      color="primary"
    >
      <Grid container
        spacing={1}
        justify="center"
        alignItems="center"
        style={{ height: 'inherit', margin: '0 -8px' }}
      >
        <Grid item>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<FontAwesomeIcon icon={faDiscord} />}
            href="https://discord.gg/F438vM5"
            target="_blank"
          >
            Join our Discord
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<FontAwesomeIcon icon={faGithub} />}
            href="https://github.com/ipeterov/dotapracc"
            target="_blank"
          >
            Watch us on GitHub
          </Button>
        </Grid>
      </Grid>
    </AppBar>
  );
}

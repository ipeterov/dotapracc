import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {
  Link,
  Tooltip,
  Typography,
} from '@material-ui/core';


const HtmlTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: '#ffffff',
    color: '#000000',
    maxWidth: 400,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}))(Tooltip);


export default function SteamSignIn({ next }) {
  return (
    <HtmlTooltip
      interactive
      title={(
        <Typography>
          It's safe. dotapra.cc only gets your public info, like avatar and username.
          We took this image from an{' '}
          <Link
            target="_blank"
            href="https://steamcommunity.com/dev"
          >
            official steam page
          </Link>
          . Here's a{' '}
          <Link
            target="_blank"
            href="https://steamcommunity.com/discussions/forum/1/620696522175992548/"
          >
            steamcommunity thread
          </Link>
          {' '}about safety of Steam OpenID.
        </Typography>
      )}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <img
        alt="Sign in with Steam"
        src="/static/frontend/steam.png"
        onClick={() => {
          /* eslint-disable-next-line no-undef */
          window.location.href = `${LOGIN_URL}?next=${next}`;
        }}
        style={{ cursor: 'pointer', marginTop: 4 }}
      />
    </HtmlTooltip>
  );
}

SteamSignIn.defaultProps = {
  next: '/',
};

SteamSignIn.propTypes = {
  next: PropTypes.string,
};

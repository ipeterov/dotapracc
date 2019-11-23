import React from 'react';
import PropTypes from 'prop-types';
import { Button, CircularProgress } from '@material-ui/core';


const MyButton = (props) => {
  const {
    children,
    loading,
    disabled,
    ...rest
  } = props;

  const newDisabled = disabled || loading;
  return (
    <Button
      disabled={newDisabled}
      {...rest}
    >
      {children}
      {
        loading && (
          <CircularProgress
            size={24}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: -12,
              marginLeft: -12,
            }}
          />
        )
      }
    </Button>
  );
};

MyButton.defaultProps = {
  loading: false,
  disabled: false,
};

MyButton.propTypes = {
  children: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default MyButton;

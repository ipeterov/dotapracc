import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';


export default function AddHeroDialog(props) {
  const {
    allHeroes, handleAdd, disabled, zeroHeroesSelected,
  } = props;

  const [open, setOpen] = React.useState(false);
  const [heroId, setHeroId] = React.useState('');
  const btn = React.useRef(null);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const focusAddHeroButton = () => {
    const timeout = setTimeout(() => {
      btn.current.focus();
    }, 100);

    return () => {
      clearTimeout(timeout);
    };
  };

  return (
    <div>
      <Button
        variant="contained"
        color={zeroHeroesSelected ? 'secondary' : 'primary'}
        onClick={handleClickOpen}
        disabled={disabled}
      >
        <AddIcon />
        Add hero to train
      </Button>
      {!disabled && (
        <Dialog open={open} onClose={handleClose}>
          <DialogContent>
            <DialogContentText>
              Select a hero to train. You will only get matches with people
              who want to play against your selected heroes.
            </DialogContentText>
            <FormControl>
              <InputLabel>Hero</InputLabel>
              <Select
                style={{ width: '250px' }}
                value={heroId}
                onChange={({ target }) => {
                  setHeroId(target.value);
                  focusAddHeroButton();
                }}
              >
                {allHeroes.map((hero) => (
                  <MenuItem key={hero.id} value={hero.id}>{hero.name}</MenuItem>
                ))}
              </Select>
              <FormHelperText>Try typing hero names when select is open</FormHelperText>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button
              ref={btn}
              onClick={() => {
                handleClose();
                handleAdd(heroId);
                setHeroId('');
              }}
              color="primary"
            >
              Add hero
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}

AddHeroDialog.propTypes = {
  zeroHeroesSelected: PropTypes.bool.isRequired,
  handleAdd: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  allHeroes: PropTypes.array.isRequired,
};

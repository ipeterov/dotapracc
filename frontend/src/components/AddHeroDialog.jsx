import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Fab,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';


export default function AddHeroDialog({ allHeroes, handleAdd, disabled }) {
  const [open, setOpen] = React.useState(false);
  const [heroId, setHeroId] = React.useState('');

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Fab
        color="secondary"
        onClick={handleClickOpen}
        style={{
          right: '20px',
          bottom: '20px',
          position: 'fixed',
          zIndex: 1500,
        }}
      >
        <AddIcon />
      </Fab>
      <Button
        variant="contained"
        color="primary"
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
              Select a hero to add to your matching profile. You will only get
              matches with people who want to play against your heroes.
            </DialogContentText>
            <FormControl>
              <InputLabel>Hero</InputLabel>
              <Select
                style={{ width: '200px' }}
                value={heroId}
                onChange={({ target }) => { setHeroId(target.value); }}
              >
                {allHeroes.map((hero) => (
                  <MenuItem key={hero.id} value={hero.id}>{hero.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button
              onClick={() => { handleClose(); handleAdd(heroId); }}
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
  handleAdd: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  allHeroes: PropTypes.array.isRequired,
};

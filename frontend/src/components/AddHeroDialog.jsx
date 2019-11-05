import React from 'react';
import PropTypes from 'prop-types';
import {
  Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  FormControl, InputLabel, Select, MenuItem,
} from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add';


export default function AddHeroDialog({ allHeroes, handleAdd }) {
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
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        <AddIcon />
        Add hero to train
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogContent>
          <DialogContentText>
            Add a hero to your matching profile. You will only get matches
            with people who want to play against your heroes.
          </DialogContentText>
          <FormControl>
            <InputLabel>Hero</InputLabel>
            <Select
              autoFocus
              style={{ width: '200px' }}
              value={heroId}
              onChange={({target}) => {setHeroId(target.value)}}
            >
              {allHeroes.map(hero => (
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
            onClick={() => {handleClose(); handleAdd(heroId)}}
            color="primary"
          >
            Add hero
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

AddHeroDialog.propTypes = {
  handleAdd: PropTypes.func.isRequired,
};

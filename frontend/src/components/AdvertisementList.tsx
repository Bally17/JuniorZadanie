import { useState } from 'react';
import { Button } from '@mui/material';
import AddAdDialog from './AddAdDialog'; // uprav cestu podľa umiestnenia súboru
import './AdvertisementList.css';

export default function AdvertisementList() {
  const [open, setOpen] = useState(false);

  return (
    <div className="advertisement-container">
      <h2>Advertisements</h2>

      <Button variant="contained" onClick={() => setOpen(true)}>
        Add Advertisement
      </Button>

      <AddAdDialog open={open} onClose={() => setOpen(false)} />
    </div>
  );
}


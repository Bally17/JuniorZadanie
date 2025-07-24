import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button
} from '@mui/material';
import { useState } from 'react';
import './AddAdDialog.css';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddAdDialog({ open, onClose }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    ico: '',
    address: '',
    adText: '',
    logo: null as File | null
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData(prev => ({ ...prev, logo: e.target.files![0] }));
    }
  };

  const handleSubmit = () => {
    console.log(formData);
    onClose(); // zatiaľ len zavrie
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>New Advertisement</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        <TextField label="Company Name" name="name" value={formData.name} onChange={handleChange} />
        <TextField label="IČO" name="ico" value={formData.ico} onChange={handleChange} />
        <TextField label="Address" name="address" value={formData.address} onChange={handleChange} />
        <TextField label="Advertisement Text" name="adText" multiline rows={3} value={formData.adText} onChange={handleChange} />

        <input
          accept="image/png, image/jpeg"
          type="file"
          id="upload-logo"
          className='logo-input'
          onChange={handleLogoUpload}
        />
        <label htmlFor="upload-logo">
          <Button variant="outlined" component="span">
            {formData.logo ? `Logo: ${formData.logo.name}` : 'Upload Logo'}
          </Button>
        </label>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

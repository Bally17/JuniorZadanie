import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Autocomplete, Checkbox, FormControlLabel
} from '@mui/material';
import { useState, useEffect } from 'react';
import axios from 'axios';
import './AddAdDialog.css';
import type { Ad, Company } from '../types';



const parse: any = require('autosuggest-highlight/parse');
const match: any = require('autosuggest-highlight/match');


interface Props {
  open: boolean;
  onClose: () => void;
  adToEdit?: Ad | null;
}



export default function AddAdDialog({ open, onClose, adToEdit }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    ico: '',
    address: '',
    adText: '',
    logo: null as File | null,
    isTop: false
  });
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    if (adToEdit) {
      setFormData({
        name: adToEdit.company.name,
        ico: adToEdit.company.ico,
        address: adToEdit.company.municipality,
        adText: adToEdit.adText,
        logo: null,
        isTop: adToEdit.isTop
      });
      setInputValue(`${adToEdit.company.name} (${adToEdit.company.ico})`);
      setSelectedCompany(adToEdit.company);
    } else {
      setFormData({
        name: '',
        ico: '',
        address: '',
        adText: '',
        logo: null,
        isTop: false
      });
      setInputValue('');
      setSelectedCompany(null);
    }
  }, [adToEdit, open]);

  useEffect(() => {
    const controller = new AbortController();
    const query = inputValue.trim();

    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    axios.get(`/api/search?q=${query}`, { signal: controller.signal })
      .then(res => setSuggestions(res.data.slice(0, 10)))
      .catch(err => {
        if (!axios.isCancel(err)) console.error(err);
      });

    return () => controller.abort();
  }, [inputValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData(prev => ({ ...prev, logo: e.target.files![0] }));
    }
  };

  const handleSubmit = async () => {
    if (!selectedCompany) {
      alert('You must select a company from the autocomplete.');
      return;
    }

    const form = new FormData();
    form.append('companyId', selectedCompany.id.toString());
    form.append('adText', formData.adText);
    form.append('isTop', formData.isTop.toString());
    if (formData.logo) form.append('logo', formData.logo);

    try {
      if (adToEdit) {
        await axios.put(`/api/ads/${adToEdit.id}`, form);
      } else {
        await axios.post('/api/ads', form);
      }

      onClose();
    } catch (err) {
      console.error('Error saving ad:', err);
      alert('Failed to save advertisement.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{adToEdit ? 'Edit Advertisement' : 'New Advertisement'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        <Autocomplete
          freeSolo
          disabled={!!adToEdit}
          options={suggestions}
          getOptionLabel={(option) => typeof option === 'string' ? option : `${option.name} (${option.ico})`}
          inputValue={inputValue}
          onInputChange={(e, newInputValue) => setInputValue(newInputValue)}
          onChange={(e, value) => {
            if (value && typeof value !== 'string') {
              setSelectedCompany(value);
              setFormData(prev => ({
                ...prev,
                name: value.name,
                ico: value.ico,
                address: value.municipality
              }));
              setInputValue(`${value.name} (${value.ico})`);
            } else {
              setSelectedCompany(null);
            }
          }}
          renderInput={(params) => (
            <TextField {...params} label="Search for a company (name or ICO)" />
          )}
          renderOption={(props, option) => {
            const matches = match(`${option.name} (${option.ico})`, inputValue);
            const parts = parse(`${option.name} (${option.ico})`, matches);
            return (
              <li {...props}>
                {parts.map((part: { text: string; highlight: boolean }, index: number) => (
                  <span key={index} className={part.highlight ? 'autocomplete-highlight' : ''}>
                    {part.text}
                  </span>
                ))}
              </li>
            );
          }}
        />

        <TextField label="ICO" name="ico" value={formData.ico} onChange={handleChange} />
        <TextField label="Address" name="address" value={formData.address} onChange={handleChange} />
        <TextField label="Advertisement Text" name="adText" multiline rows={3} value={formData.adText} onChange={handleChange} />

        <FormControlLabel
          control={
            <Checkbox
              checked={formData.isTop}
              onChange={(e) => setFormData(prev => ({ ...prev, isTop: e.target.checked }))}
            />
          }
          label="Top Advertisement"
        />

        <input
          accept="image/png, image/jpeg"
          type="file"
          id="upload-logo"
          className="logo-input"
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
        <Button variant="contained" onClick={handleSubmit} disabled={!selectedCompany}>
          {adToEdit ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

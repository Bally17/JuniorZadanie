import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Autocomplete
} from '@mui/material';
import { useState, useEffect } from 'react';
import axios from 'axios';
import './AddAdDialog.css';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface Company {
  id: number;
  rpoId: number;
  ico: string;
  name: string;
  municipality: string;
  establishment: string;
  termination: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AddAdDialog({ open, onClose }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    ico: '',
    address: '',
    adText: '',
    logo: null as File | null
  });

  const [inputValue, setInputValue] = useState(''); // 🔧 ovládanie autocomplete inputu
  const [suggestions, setSuggestions] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);


  const handleCancel = () => {
    setFormData({
        name: '',
        ico: '',
        address: '',
        adText: '',
        logo: null
    });
    setInputValue('');
    setSuggestions([]);
    onClose();
    setSelectedCompany(null);
    };


  useEffect(() => {
    const controller = new AbortController();
    const query = inputValue.trim();

    if (query.length < 3) {
        setSuggestions([]);
        return;
    }

    const fetchSuggestions = async () => {
        try {
        const res = await axios.get(`/api/search?q=${query}`, {
            signal: controller.signal
        });
        setSuggestions(res.data.slice(0, 10));
        } catch (err) {
        if (!axios.isCancel(err)) {
            console.error(err);
        }
        }
    };

    fetchSuggestions();
    return () => controller.abort();
    }, [inputValue]);


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

  const handleSubmit = async () => {
    try {
        if (!selectedCompany) {
        alert('Firma musí byť vybraná z autocomplete.');
        return;
        }

        const form = new FormData();
        form.append('companyId', selectedCompany.id.toString());
        form.append('adText', formData.adText);
        if (formData.logo) form.append('logo', formData.logo);

        await axios.post('/api/ads', form);

        // Reset
        setFormData({
        name: '',
        ico: '',
        address: '',
        adText: '',
        logo: null
        });
        setInputValue('');
        setSuggestions([]);
        setSelectedCompany(null);
        onClose();
    } catch (err) {
        console.error('Error submitting ad:', err);
        alert('Nepodarilo sa uložiť inzerát.');
    }
    };


  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>New Advertisement</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        <Autocomplete
            freeSolo
            options={suggestions}
            getOptionLabel={(option) =>
                typeof option === 'string' ? option : `${option.name} (${option.ico})`
            }
            inputValue={inputValue}
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            onChange={(e, value) => {
                if (value && typeof value !== 'string') {
                    setSelectedCompany(value); // <- uchovaj vybranú firmu
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
                <TextField
                {...params}
                label="Vyhľadať firmu (názov alebo IČO)"
                />
            )}
        />


        <TextField
          label="IČO"
          name="ico"
          value={formData.ico}
          onChange={handleChange}
        />

        <TextField
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />

        <TextField
          label="Advertisement Text"
          name="adText"
          multiline
          rows={3}
          value={formData.adText}
          onChange={handleChange}
        />

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
        <Button onClick={handleCancel}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!selectedCompany}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

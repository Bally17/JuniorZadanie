import { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import axios from 'axios';
import AddAdDialog from './AddAdDialog'; // uprav cestu podľa umiestnenia súboru
import './AdvertisementList.css';

interface Ad {
  id: number;
  adText: string;
  logoPath?: string;
  company: {
    name: string;
    ico: string;
    municipality: string;
  };
}

export default function AdvertisementList() {
  const [open, setOpen] = useState(false);
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    fetchAds();
    }, []);

    const fetchAds = async () => {
    try {
        const res = await axios.get('/api/ads');
        setAds(res.data);
    } catch (err) {
        console.error('Error loading ads:', err);
    }
    };


  return (
    <div className="advertisement-container">
      <h2>Advertisements</h2>

      <Button variant="contained" onClick={() => setOpen(true)}>
        Add Advertisement
      </Button>

      <AddAdDialog open={open} onClose={() => {setOpen(false); fetchAds();}} />

      <div className="ad-list">
        {ads.map((ad) => (
          <div key={ad.id} className="ad-item">
            <h3>{ad.company.name} ({ad.company.ico})</h3>
            <p>{ad.company.municipality}</p>
            <p>{ad.adText}</p>
            {ad.logoPath && (
              <img
                src={`http://localhost:4000/${ad.logoPath}`}
                alt="Company logo"
                style={{ maxWidth: '150px', marginTop: '10px' }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

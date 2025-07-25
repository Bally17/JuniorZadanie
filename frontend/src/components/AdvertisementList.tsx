import { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import axios from 'axios';
import AddAdDialog from './AddAdDialog'; // uprav cestu podľa umiestnenia súboru
import './AdvertisementList.css';

interface Ad {
  id: number;
  adText: string;
  logoPath?: string;
  createdAt: string;
  company: {
    name: string;
    ico: string;
    municipality: string;
  };
}

export default function AdvertisementList() {
  const [open, setOpen] = useState(false);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loadingPdfId, setLoadingPdfId] = useState<number | null>(null);

  useEffect(() => {
    fetchAds();
    }, []);

    const fetchAds = async () => {
    try {
        const res = await axios.get<Ad[]>('/api/ads');
        setAds(res.data);
    } catch (err) {
        console.error('Error loading ads:', err);
    }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this ad?')) return;

        try {
            await axios.delete(`/api/ads/${id}`);
            fetchAds(); // aktualizuj zoznam
        } catch (err) {
            console.error('Failed to delete ad:', err);
            alert('Nepodarilo sa vymazať inzerát.');
        }
    };



  return (
    <div className="advertisement-container">
      <h2>Inzeráty ({ads.length})</h2>


      <Button variant="contained" onClick={() => setOpen(true)}>
        Pridať inzerát
      </Button>


      <AddAdDialog open={open} onClose={() => {setOpen(false); fetchAds();}} />

      <div className="ad-list">
        {ads.map((ad) => (
            <div key={ad.id} className="ad-item">
                <h3>{ad.company.name} ({ad.company.ico})</h3>
                <p>{ad.company.municipality}</p>
                <p>{ad.adText}</p>
                <p style={{ fontStyle: 'italic', fontSize: '0.9em' }}>
                  Pridané: {new Date(ad.createdAt).toLocaleDateString('sk-SK')}
                </p>
                {ad.logoPath && (
                <img
                    src={`http://localhost:4000/${ad.logoPath}`}
                    alt="Company logo"
                    style={{ maxWidth: '150px', marginTop: '10px' }}
                />
                )}
                <Button
                variant="outlined"
                color="error"
                onClick={() => handleDelete(ad.id)}
                style={{ marginTop: '10px' }}
                >
                Delete
                </Button>
                <Button
                  variant="outlined"
                  disabled={loadingPdfId === ad.id}
                  onClick={async () => {
                    setLoadingPdfId(ad.id);
                    try {
                      const res = await fetch(`/api/pdf/${ad.id}`);
                      const blob = await res.blob();
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `inzerat-${ad.id}.pdf`;
                      link.click();
                      URL.revokeObjectURL(url);
                    } catch (err) {
                      console.error('PDF download failed', err);
                      alert('Nepodarilo sa stiahnuť PDF.');
                    } finally {
                      setLoadingPdfId(null);
                    }
                  }}
                >
                  {loadingPdfId === ad.id ? 'Sťahujem...' : 'Stiahnuť PDF'}
                </Button>

            </div>
        ))}
      </div>
    </div>
  );
}

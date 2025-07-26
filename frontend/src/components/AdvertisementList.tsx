import { useCallback, useEffect, useState } from 'react';
import { Button } from '@mui/material';
import axios from 'axios';
import AddAdDialog from './AddAdDialog';
import './AdvertisementList.css';
import type { Ad } from '../types';



export default function AdvertisementList() {
  const [open, setOpen] = useState(false);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loadingPdfId, setLoadingPdfId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);


  const fetchAds = useCallback(async () => {
    try {
      const res = await axios.get(`/api/ads?page=${page}&limit=10`);
      setAds(res.data.ads);
      setTotalPages(res.data.pages);
      setTotalCount(res.data.totalCount);
    } catch (err) {
      console.error('Error loading ads:', err);
    }
  }, [page]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this advertisement?')) return;

    try {
      await axios.delete(`/api/ads/${id}`);
      fetchAds();
    } catch (err) {
      console.error('Failed to delete advertisement:', err);
      alert('Failed to delete advertisement.');
    }
  };

  return (
    <div className="advertisement-container">
      <h2>
        {ads.length > 0
          ? `Advertisements (${totalCount})`
          : 'No advertisements found'}
      </h2>


      <Button variant="contained" onClick={() => setOpen(true)}>
        Add Advertisement
      </Button>

      <AddAdDialog
        open={open}
        onClose={() => {
          setOpen(false);
          setEditingAd(null);
          fetchAds();
        }}
        adToEdit={editingAd}
      />


      <div className="ad-list">
        {ads.map((ad) => (
          
          <div key={ad.id} className="ad-item">
            {ad.isTop && <span className="top-badge">TOP</span>}
            <h3>{ad.company.name} ({ad.company.ico})</h3>
            <p>{ad.company.municipality}</p>
            <p>{ad.adText}</p>
            <p className="ad-date">
              Created: {new Date(ad.createdAt).toLocaleDateString('en-GB')}
            </p>

            {ad.logoPath && (
              <img
                src={`http://localhost:4000/${ad.logoPath}`}
                alt="Company logo"
                className="ad-logo"
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
              onClick={() => {
                setEditingAd(ad);
                setOpen(true);
              }}
              style={{ marginTop: '10px', marginLeft: '10px' }}
            >
              Edit
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
                  link.download = `advertisement-${ad.id}.pdf`;
                  link.click();
                  URL.revokeObjectURL(url);
                } catch (err) {
                  console.error('PDF download failed', err);
                  alert('Failed to download PDF.');
                } finally {
                  setLoadingPdfId(null);
                }
              }}
            >
              {loadingPdfId === ad.id ? 'Downloading...' : 'Download PDF'}
            </Button>
          </div>
        ))}
      </div>

      {totalPages > 0 && (
        <div className="pagination-container">
          <Button
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="pagination-info">Page {page} of {totalPages}</span>
          <Button
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

    </div>
  );
}

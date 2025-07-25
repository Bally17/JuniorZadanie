import { useEffect, useState } from 'react';
import './Autocomplete.css';

interface Company {
  id: number;
  name: string;
  ico: string;
  municipality: string;
}

export default function Autocomplete() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      setLoading(true);
      fetch(`http://localhost:4000/api/search?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="autocomplete-container">
        <input
        type="text"
        placeholder="Search by name or IČO"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="autocomplete-input"
        />

        {loading && <p>Loading...</p>}

        <ul className="autocomplete-list">
        {results.map((company) => (
            <li key={company.id} className="autocomplete-item">
            <strong>{company.name}</strong> — IČO: {company.ico}
            <br />
            <small>{company.municipality}</small>
            </li>
        ))}
        </ul>
    </div>
    );
}

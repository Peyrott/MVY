import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SearchBar.module.css';

const SPORTS = [
  { value: '', label: 'Todos os esportes' },
  { value: 'futebol', label: 'Futebol' },
  { value: 'futsal', label: 'Futsal' },
  { value: 'volei', label: 'Vôlei' },
  { value: 'basquete', label: 'Basquete' },
  { value: 'tenis', label: 'Tênis' },
  { value: 'beach_tennis', label: 'Beach Tennis' },
  { value: 'padel', label: 'Padel' },
  { value: 'handebol', label: 'Handebol' }
];

/**
 * Search Bar Component
 * @param {Object} props
 * @param {string} [props.initialCity]
 * @param {string} [props.initialSport]
 * @param {boolean} [props.compact]
 * @param {Function} [props.onSearch]
 */
export function SearchBar({ initialCity = '', initialSport = '', compact = false, onSearch }) {
  const [city, setCity] = useState(initialCity);
  const [sport, setSport] = useState(initialSport);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (sport) params.set('sport', sport);

    if (onSearch) {
      onSearch({ city, sport });
    } else {
      navigate(`/courts?${params.toString()}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`${styles.searchBar} ${compact ? styles.compact : ''}`}
    >
      <div className={styles.inputGroup}>
        <label htmlFor="search-city" className={styles.label}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Cidade
        </label>
        <input
          id="search-city"
          type="text"
          placeholder="Qual cidade?"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.divider} />

      <div className={styles.inputGroup}>
        <label htmlFor="search-sport" className={styles.label}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          Esporte
        </label>
        <select
          id="search-sport"
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          className={styles.select}
        >
          {SPORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className={styles.button}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        Buscar
      </button>
    </form>
  );
}

export default SearchBar;

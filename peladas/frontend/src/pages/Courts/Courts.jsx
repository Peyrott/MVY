import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CourtCard } from '../../components/CourtCard/CourtCard.jsx';
import { useCourts } from '../../hooks/useCourts.js';
import { useGeolocation } from '../../hooks/useGeolocation.js';
import { useToast } from '../../hooks/useToast.js';
import { formatSport } from '../../utils/formatters.js';
import styles from './Courts.module.css';

const SPORTS = [
  { value: '', label: 'Todos' },
  { value: 'futebol', label: 'Futebol' },
  { value: 'futsal', label: 'Futsal' },
  { value: 'volei', label: 'Vôlei' },
  { value: 'basquete', label: 'Basquete' },
  { value: 'tenis', label: 'Tênis' },
  { value: 'beach_tennis', label: 'Beach Tennis' },
  { value: 'padel', label: 'Padel' },
  { value: 'handebol', label: 'Handebol' }
];

const SORT_OPTIONS = [
  { value: 'rating', label: 'Melhor avaliação' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
  { value: 'distance', label: 'Mais próximo' }
];

/**
 * Courts Page Component
 */
export function Courts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { courts, loading, error, pagination, fetchCourts } = useCourts();
  const { location, getLocation, clearError } = useGeolocation();
  const { showError } = useToast();

  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    sport: searchParams.get('sport') || '',
    sortBy: 'rating',
    page: 1
  });

  const [searchText, setSearchText] = useState('');

  // Fetch courts when filters change
  useEffect(() => {
    const loadCourts = async () => {
      try {
        await fetchCourts({
          ...filters,
          lat: location.latitude || undefined,
          lng: location.longitude || undefined
        });
      } catch (err) {
        showError(err.message);
      }
    };

    loadCourts();
  }, [filters, location.latitude, location.longitude, fetchCourts, showError]);

  // Handle location error
  useEffect(() => {
    if (location.error) {
      showError(location.error);
      clearError();
    }
  }, [location.error, showError, clearError]);

  const handleSearch = useCallback(() => {
    setFilters(prev => ({ ...prev, city: searchText, page: 1 }));
    setSearchParams({ city: searchText, sport: filters.sport });
  }, [searchText, filters.sport, setSearchParams]);

  const handleSportChange = useCallback((sport) => {
    setFilters(prev => ({ ...prev, sport, page: 1 }));
    setSearchParams({ city: filters.city, sport });
  }, [filters.city, setSearchParams]);

  const handleSortChange = useCallback((sortBy) => {
    setFilters(prev => ({ ...prev, sortBy, page: 1 }));
  }, []);

  const handlePageChange = useCallback((page) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleGeolocation = useCallback(() => {
    getLocation();
    setFilters(prev => ({ ...prev, sortBy: 'distance', page: 1 }));
  }, [getLocation]);

  return (
    <div className={styles.courts}>
      <div className={styles.header}>
        <div className={styles.container}>
          <h1 className={styles.title}>Encontre sua quadra</h1>

          <div className={styles.searchBar}>
            <div className={styles.searchInput}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por nome ou cidade..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button className={styles.searchButton} onClick={handleSearch}>
              Buscar
            </button>
          </div>

          <div className={styles.filters}>
            <div className={styles.sportFilter}>
              {SPORTS.map((sport) => (
                <button
                  key={sport.value}
                  className={`${styles.sportButton} ${filters.sport === sport.value ? styles.active : ''}`}
                  onClick={() => handleSportChange(sport.value)}
                >
                  {sport.label}
                </button>
              ))}
            </div>

            <div className={styles.actions}>
              <button
                className={styles.locationButton}
                onClick={handleGeolocation}
                disabled={location.loading}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {location.loading ? 'Obtendo...' : 'Usar minha localização'}
              </button>

              <select
                className={styles.sortSelect}
                value={filters.sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {loading ? (
          <div className={styles.grid}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonImage} />
                <div className={styles.skeletonContent}>
                  <div className={styles.skeletonTitle} />
                  <div className={styles.skeletonText} />
                </div>
              </div>
            ))}
          </div>
        ) : courts.length > 0 ? (
          <>
            <div className={styles.resultsInfo}>
              <span>{pagination.total} quadras encontradas</span>
            </div>

            <div className={styles.grid}>
              {courts.map((court) => (
                <CourtCard key={court.id} court={court} />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                  className={styles.pageButton}
                >
                  ← Anterior
                </button>

                <div className={styles.pageNumbers}>
                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const page = i + 1;
                    // Show first, last, current, and neighbors
                    if (
                      page === 1 ||
                      page === pagination.totalPages ||
                      (page >= filters.page - 1 && page <= filters.page + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`${styles.pageNumber} ${filters.page === page ? styles.active : ''}`}
                        >
                          {page}
                        </button>
                      );
                    }
                    // Show ellipsis
                    if (page === filters.page - 2 || page === filters.page + 2) {
                      return <span key={page} className={styles.ellipsis}>...\u003c/span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page === pagination.totalPages}
                  className={styles.pageButton}
                >
                  Próximo →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🔍</div>
            <h3>Nenhuma quadra encontrada</h3>
            <p>Tente ajustar seus filtros ou buscar por outra cidade.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Courts;

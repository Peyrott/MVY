import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { api } from '../../services/api.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import styles from './Dashboard.module.css';

const PERIODS = [
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: '90d', label: '90 dias' },
  { value: '1y', label: '1 ano' }
];

const SPORTS = [
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
 * Dashboard Page Component (Owner only)
 */
export function Dashboard() {
  const { isOwner } = useAuth();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();

  const [period, setPeriod] = useState('30d');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [courts, setCourts] = useState([]);

  // Form state for new court
  const [formData, setFormData] = useState({
    name: '',
    sport: 'futebol',
    description: '',
    price_per_hour: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    amenities: []
  });

  useEffect(() => {
    if (!isOwner) {
      navigate('/');
      return;
    }

    loadDashboard();
  }, [isOwner, navigate, period]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/dashboard?period=${period}`);
      setStats(data);
      setCourts(data.courts || []);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCourt = async (courtId, currentStatus) => {
    try {
      await api.patch(`/courts/${courtId}/toggle`);
      setCourts(prev =>
        prev.map(c =>
          c.id === courtId ? { ...c, is_active: !currentStatus } : c
        )
      );
      showSuccess(`Quadra ${currentStatus ? 'desativada' : 'ativada'} com sucesso!`);
    } catch (err) {
      showError(err.message);
    }
  };

  const handleCreateCourt = async (e) => {
    e.preventDefault();
    try {
      await api.post('/courts', formData);
      showSuccess('Quadra criada com sucesso!');
      setShowAddForm(false);
      setFormData({
        name: '',
        sport: 'futebol',
        description: '',
        price_per_hour: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        amenities: []
      });
      loadDashboard();
    } catch (err) {
      showError(err.message);
    }
  };

  const addAmenity = () => {
    setFormData(prev => ({
      ...prev,
      amenities: [...prev.amenities, '']
    }));
  };

  const updateAmenity = (index, value) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.map((a, i) => i === index ? value : a)
    }));
  };

  const removeAmenity = (index) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Dashboard</h1>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className={styles.periodSelect}
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>{`Últimos ${p.label}`}</option>
            ))}
          </select>
        </div>

        {/* Stats Cards */}
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats?.totalBookings || 0}</span>
            <span className={styles.statLabel}>Reservas</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{formatCurrency(stats?.revenue || 0)}</span>
            <span className={styles.statLabel}>Receita Total</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{formatCurrency(stats?.ownerReceives || 0)}</span>
            <span className={styles.statLabel}>Você Recebe</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{formatCurrency(stats?.platformFee || 0)}</span>
            <span className={styles.statLabel}>Taxa da Plataforma</span>
          </div>
        </div>

        {/* Courts Section */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Minhas Quadras</h2>
            <button
              className={styles.addButton}
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? 'Cancelar' : '+ Nova Quadra'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleCreateCourt} className={styles.addForm}>
              <div className={styles.formGrid}>
                <input
                  placeholder="Nome da quadra"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
                <select
                  value={formData.sport}
                  onChange={(e) => setFormData(prev => ({ ...prev, sport: e.target.value }))}
                >
                  {SPORTS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <input
                  placeholder="Preço/hora (R$)"
                  type="number"
                  value={formData.price_per_hour}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_per_hour: e.target.value }))}
                  required
                />
                <input
                  placeholder="Endereço"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  required
                />
                <input
                  placeholder="Cidade"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  required
                />
                <input
                  placeholder="Estado"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  required
                />
              </div>
              <textarea
                placeholder="Descrição"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
              <div className={styles.amenitiesSection}>
                <label>Comodidades</label>
                {formData.amenities.map((amenity, index) => (
                  <div key={index} className={styles.amenityRow}>
                    <input
                      value={amenity}
                      onChange={(e) => updateAmenity(index, e.target.value)}
                      placeholder="Ex: Vestiário"
                    />
                    <button type="button" onClick={() => removeAmenity(index)} className={styles.removeAmenity}>
                      ×
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addAmenity} className={styles.addAmenity}>
                  + Adicionar comodidade
                </button>
              </div>
              <button type="submit" className={styles.submitButton}>Criar Quadra</button>
            </form>
          )}

          <div className={styles.courtsList}>
            {courts.map((court) => (
              <div key={court.id} className={styles.courtRow}>
                <div className={styles.courtInfo}>
                  <h3>{court.name}</h3>
                  <span className={court.is_active ? styles.active : styles.inactive}>
                    {court.is_active ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
                <div className={styles.courtStats}>
                  <span>{formatCurrency(court.price_per_hour)}/hora</span>
                  <span>★ {court.rating} ({court.review_count})</span>
                </div>
                <button
                  onClick={() => handleToggleCourt(court.id, court.is_active)}
                  className={styles.toggleButton}
                >
                  {court.is_active ? 'Desativar' : 'Ativar'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className={styles.section}>
          <h2>Últimas Reservas</h2>
          <div className={styles.bookingsTable}>
            <div className={styles.tableHeader}>
              <span>Quadra</span>
              <span>Data</span>
              <span>Valor</span>
              <span>Status</span>
            </div>
            {stats?.recentBookings?.map((booking) => (
              <div key={booking.id} className={styles.tableRow}>
                <span>{booking.court?.name}</span>
                <span>{formatDate(booking.booking_date)}</span>
                <span>{formatCurrency(booking.total)}</span>
                <span className={styles[booking.status]}>{booking.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

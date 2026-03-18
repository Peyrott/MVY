import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useBookings } from '../../hooks/useBookings.js';
import { useCourts } from '../../hooks/useCourts.js';
import { useToast } from '../../hooks/useToast.js';
import { CourtCard } from '../../components/CourtCard/CourtCard.jsx';
import { getInitials, formatCurrency, formatDate, formatTime } from '../../utils/formatters.js';
import { formatPhone } from '../../utils/formatters.js';
import styles from './Profile.module.css';

const TABS = [
  { id: 'bookings', label: 'Minhas Reservas' },
  { id: 'favorites', label: 'Favoritos' }
];

const STATUS_LABELS = {
  pending: { label: 'Pendente', class: styles.statusPending },
  confirmed: { label: 'Confirmada', class: styles.statusConfirmed },
  cancelled: { label: 'Cancelada', class: styles.statusCancelled },
  completed: { label: 'Concluída', class: styles.statusCompleted }
};

/**
 * Profile Page Component
 */
export function Profile() {
  const { profile, signOut, updateProfile } = useAuth();
  const { bookings, fetchMyBookings, cancelBooking } = useBookings();
  const { favorites, fetchFavorites } = useCourts();
  const { showError, showSuccess } = useToast();

  const [activeTab, setActiveTab] = useState('bookings');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchMyBookings(), fetchFavorites()]);
      } catch (err) {
        showError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchMyBookings, fetchFavorites, showError]);

  useEffect(() => {
    if (profile) {
      setEditForm({
        name: profile.name || '',
        phone: profile.phone || ''
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    const { error } = await updateProfile({
      name: editForm.name,
      phone: editForm.phone
    });

    if (error) {
      showError(error.message);
    } else {
      showSuccess('Perfil atualizado com sucesso!');
      setIsEditing(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Tem certeza que deseja cancelar esta reserva?')) return;

    try {
      await cancelBooking(bookingId);
      showSuccess('Reserva cancelada com sucesso!');
    } catch (err) {
      showError(err.message);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.profile}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.avatar}>
            {getInitials(profile?.name)}
          </div>
          <div className={styles.userInfo}>
            {isEditing ? (
              <div className={styles.editForm}>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome"
                />
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Telefone"
                />
                <div className={styles.editActions}>
                  <button onClick={handleSaveProfile} className={styles.saveButton}>Salvar</button>
                  <button onClick={() => setIsEditing(false)} className={styles.cancelButton}>Cancelar</button>
                </div>
              </div>
            ) : (
              <>
                <h1 className={styles.name}>{profile?.name}</h1>
                <p className={styles.email}>{profile?.email}</p>
                {profile?.phone && <p className={styles.phone}>{formatPhone(profile.phone)}</p>}
                <button onClick={() => setIsEditing(true)} className={styles.editButton}>
                  Editar perfil
                </button>
              </>
            )}
          </div>
          <button onClick={handleSignOut} className={styles.signOutButton}>
            Sair
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className={styles.content}>
          {activeTab === 'bookings' ? (
            bookings.length > 0 ? (
              <div className={styles.bookingsList}>
                {bookings.map((booking) => {
                  const status = STATUS_LABELS[booking.status];
                  return (
                    <div key={booking.id} className={styles.bookingCard}>
                      <div className={styles.bookingInfo}>
                        <h3>{booking.court?.name || 'Quadra'}</h3>
                        <div className={styles.bookingDetails}>
                          <span>📅 {formatDate(booking.booking_date)}</span>
                          <span>🕐 {formatTime(booking.time_slot)}</span>
                          <span>💰 {formatCurrency(booking.total)}</span>
                        </div>
                        <span className={`${styles.status} ${status.class}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className={styles.bookingActions}>
                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className={styles.cancelAction}
                          >
                            Cancelar
                          </button>
                        )}
                        {booking.status === 'completed' && (
                          <Link
                            to={`/courts/${booking.court_id}`}
                            className={styles.reviewAction}
                          >
                            Avaliar
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>📅</div>
                <h3>Nenhuma reserva</h3>
                <p>Você ainda não fez nenhuma reserva.</p>
                <Link to="/courts" className={styles.emptyAction}>Buscar quadras</Link>
              </div>
            )
          ) : favorites.length > 0 ? (
            <div className={styles.favoritesGrid}>
              {favorites.map((court) => (
                <CourtCard key={court.id} court={court} />
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>❤️</div>
              <h3>Nenhum favorito</h3>
              <p>Você ainda não salvou nenhuma quadra.</p>
              <Link to="/courts" className={styles.emptyAction}>Explorar quadras</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;

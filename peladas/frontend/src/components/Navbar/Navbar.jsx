import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { getInitials } from '../../utils/formatters.js';
import styles from './Navbar.module.css';

/**
 * Navbar Component
 * Main navigation bar with user menu
 */
export function Navbar() {
  const { isLoggedIn, isOwner, profile, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>⚽</span>
          <span className={styles.logoText}>Peladas</span>
        </Link>

        <div className={styles.links}>
          <Link to="/courts" className={styles.link}>Quadras</Link>
          {isOwner && (
            <Link to="/dashboard" className={styles.link}>Dashboard</Link>
          )}
        </div>

        <div className={styles.actions}>
          {isLoggedIn ? (
            <div className={styles.userMenu}>
              <button
                className={styles.userButton}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-expanded={menuOpen}
                aria-haspopup="true"
              >
                <div className={styles.avatar}>
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.name}
                      className={styles.avatarImage}
                    />
                  ) : (
                    <span className={styles.avatarInitials}>
                      {getInitials(profile?.name)}
                    </span>
                  )}
                </div>
                <span className={styles.userName}>{profile?.name}</span>
                <svg
                  className={`${styles.chevron} ${menuOpen ? styles.chevronOpen : ''}`}
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M4 6L8 10L12 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {menuOpen && (
                <div className={styles.dropdown}>
                  <Link
                    to="/profile"
                    className={styles.dropdownItem}
                    onClick={() => setMenuOpen(false)}
                  >
                    Meu Perfil
                  </Link>
                  {isOwner && (
                    <Link
                      to="/dashboard"
                      className={styles.dropdownItem}
                      onClick={() => setMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    className={styles.dropdownItem}
                    onClick={handleSignOut}
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/" className={styles.loginButton}>
              Entrar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

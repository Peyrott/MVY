import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { validateEmail, validatePassword, validateRequired, validateMinLength } from '../../utils/validators.js';
import styles from './AuthModal.module.css';

/**
 * Auth Modal Component
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Function} [props.onSuccess]
 */
export function AuthModal({ isOpen, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { showError, showSuccess } = useToast();

  if (!isOpen) return null;

  const validateLogin = () => {
    const newErrors = {};
    if (!validateEmail(loginEmail)) newErrors.loginEmail = 'E-mail inválido';
    if (!validateRequired(loginPassword)) newErrors.loginPassword = 'Senha é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegister = () => {
    const newErrors = {};
    if (!validateMinLength(registerName, 2)) newErrors.registerName = 'Nome deve ter pelo menos 2 caracteres';
    if (!validateEmail(registerEmail)) newErrors.registerEmail = 'E-mail inválido';
    if (!validatePassword(registerPassword)) newErrors.registerPassword = 'Senha deve ter pelo menos 8 caracteres';
    if (registerPassword !== registerConfirmPassword) {
      newErrors.registerConfirmPassword = 'As senhas não coincidem';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);

    if (error) {
      showError(error.message || 'Erro ao fazer login');
    } else {
      showSuccess('Login realizado com sucesso!');
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;

    setIsLoading(true);
    const { error } = await signUp(registerEmail, registerPassword, registerName);
    setIsLoading(false);

    if (error) {
      showError(error.message || 'Erro ao criar conta');
    } else {
      showSuccess('Conta criada! Verifique seu e-mail para confirmar.');
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    setIsLoading(false);

    if (error) {
      showError(error.message || 'Erro ao entrar com Google');
    } else {
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={handleClose} aria-label="Fechar">
          ×
        </button>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'login' ? styles.active : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Entrar
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'register' ? styles.active : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Criar conta
          </button>
        </div>

        {activeTab === 'login' ? (
          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="login-email">E-mail</label>
              <input
                id="login-email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="seu@email.com"
                className={errors.loginEmail ? styles.error : ''}
              />
              {errors.loginEmail && <span className={styles.errorText}>{errors.loginEmail}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="login-password">Senha</label>
              <input
                id="login-password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Sua senha"
                className={errors.loginPassword ? styles.error : ''}
              />
              {errors.loginPassword && <span className={styles.errorText}>{errors.loginPassword}</span>}
            </div>

            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>

            <div className={styles.divider}>
              <span>ou</span>
            </div>

            <button
              type="button"
              className={styles.googleButton}
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Entrar com Google
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="register-name">Nome completo</label>
              <input
                id="register-name"
                type="text"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                placeholder="Seu nome"
                className={errors.registerName ? styles.error : ''}
              />
              {errors.registerName && <span className={styles.errorText}>{errors.registerName}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="register-email">E-mail</label>
              <input
                id="register-email"
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                placeholder="seu@email.com"
                className={errors.registerEmail ? styles.error : ''}
              />
              {errors.registerEmail && <span className={styles.errorText}>{errors.registerEmail}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="register-password">Senha</label>
              <input
                id="register-password"
                type="password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className={errors.registerPassword ? styles.error : ''}
              />
              {errors.registerPassword && <span className={styles.errorText}>{errors.registerPassword}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="register-confirm">Confirmar senha</label>
              <input
                id="register-confirm"
                type="password"
                value={registerConfirmPassword}
                onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                placeholder="Repita sua senha"
                className={errors.registerConfirmPassword ? styles.error : ''}
              />
              {errors.registerConfirmPassword && <span className={styles.errorText}>{errors.registerConfirmPassword}</span>}
            </div>

            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? 'Criando conta...' : 'Criar conta'}
            </button>

            <div className={styles.divider}>
              <span>ou</span>
            </div>

            <button
              type="button"
              className={styles.googleButton}
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Entrar com Google
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthModal;

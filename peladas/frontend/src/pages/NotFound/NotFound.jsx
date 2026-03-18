import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

/**
 * Not Found Page Component
 * 404 error page
 */
export function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.errorCode}>404</div>
        <h1 className={styles.title}>Página não encontrada</h1>
        <p className={styles.message}>
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link to="/" className={styles.button}>
          Voltar para a página inicial
        </Link>
      </div>
    </div>
  );
}

export default NotFound;

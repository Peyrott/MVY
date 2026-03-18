import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchBar } from '../../components/SearchBar/SearchBar.jsx';
import { CourtCard } from '../../components/CourtCard/CourtCard.jsx';
import { ReviewCard } from '../../components/ReviewCard/ReviewCard.jsx';
import { useCourts } from '../../hooks/useCourts.js';
import { fetchReviewsByCourt } from '../../services/reviews.service.js';
import styles from './Home.module.css';

const STEPS = [
  {
    icon: '🔍',
    title: 'Encontre',
    description: 'Busque quadras por cidade, esporte ou proximidade'
  },
  {
    icon: '📅',
    title: 'Reserve',
    description: 'Escolha o melhor horário e faça sua reserva'
  },
  {
    icon: '⚽',
    title: 'Jogue',
    description: 'Chegue na quadra e aproveite seu jogo!'
  }
];

/**
 * Home Page Component
 */
export function Home() {
  const { featuredCourts, fetchFeaturedCourts, loading } = useCourts();
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedCourts(6);
  }, [fetchFeaturedCourts]);

  useEffect(() => {
    // Fetch reviews from featured courts
    const loadReviews = async () => {
      try {
        const allReviews = [];
        for (const court of featuredCourts.slice(0, 3)) {
          const { reviews: courtReviews } = await fetchReviewsByCourt(court.id, 2);
          allReviews.push(...courtReviews);
        }
        setReviews(allReviews.slice(0, 6));
      } catch (error) {
        console.error('Error loading reviews:', error);
      } finally {
        setReviewsLoading(false);
      }
    };

    if (featuredCourts.length > 0) {
      loadReviews();
    }
  }, [featuredCourts]);

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Encontre a quadra perfeita
            <br />
            <span className={styles.highlight}>para seu jogo</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Alugue quadras de futebol, futsal, vôlei, basquete e muito mais
          </p>
          <div className={styles.searchContainer}>
            <SearchBar />
          </div>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>500+</span>
            <span className={styles.statLabel}>Quadras</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>50+</span>
            <span className={styles.statLabel}>Cidades</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>10k+</span>
            <span className={styles.statLabel}>Jogadores</span>
          </div>
        </div>
      </section>

      {/* Featured Courts Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Quadras em Destaque</h2>
            <Link to="/courts" className={styles.seeAll}>Ver todas →</Link>
          </div>

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
          ) : (
            <div className={styles.grid}>
              {featuredCourts.map((court) => (
                <CourtCard key={court.id} court={court} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className={`${styles.section} ${styles.howItWorks}`}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitleCenter}>Como Funciona</h2>
          <div className={styles.steps}>
            {STEPS.map((step, index) => (
              <div key={index} className={styles.step}>
                <div className={styles.stepNumber}>{index + 1}</div>
                <div className={styles.stepIcon}>{step.icon}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitleCenter}>O que dizem nossos usuários</h2>
          <div className={styles.reviewsGrid}>
            {reviewsLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className={styles.skeletonReview} />
              ))
            ) : (
              reviews.slice(0, 6).map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`${styles.section} ${styles.cta}`}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Tem uma quadra?</h2>
          <p className={styles.ctaDescription}>
            Cadastre sua quadra na Peladas e comece a receber reservas online.
            <br />
            É simples, rápido e você recebe 80% do valor de cada reserva.
          </p>
          <Link to="/" className={styles.ctaButton}>
            Cadastrar minha quadra
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <span className={styles.footerLogo}>⚽ Peladas</span>
            <p className={styles.footerTagline}>A melhor plataforma de aluguel de quadras esportivas do Brasil.</p>
          </div>
          <div className={styles.footerLinks}>
            <div className={styles.footerColumn}>
              <h4>Plataforma</h4>
              <Link to="/courts">Buscar quadras</Link>
              <Link to="/">Como funciona</Link>
              <Link to="/">Preços</Link>
            </div>
            <div className={styles.footerColumn}>
              <h4>Para donos</h4>
              <Link to="/">Cadastrar quadra</Link>
              <Link to="/">Dashboard</Link>
              <Link to="/">Suporte</Link>
            </div>
            <div className={styles.footerColumn}>
              <h4>Legal</h4>
              <Link to="/">Termos de uso</Link>
              <Link to="/">Privacidade</Link>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2026 Peladas. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;

/**
 * Format number as Brazilian currency
 * @param {number} value
 * @returns {string}
 */
export function formatCurrency(value) {
  if (typeof value !== 'number' || isNaN(value)) return 'R$ 0,00';

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Format date string to Brazilian format
 * @param {string} dateStr - ISO date string (YYYY-MM-DD)
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';

  const date = new Date(dateStr + 'T00:00:00');
  const options = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  };

  return date.toLocaleDateString('pt-BR', options);
}

/**
 * Format time string
 * @param {string} timeStr - Time string (HH:MM)
 * @returns {string}
 */
export function formatTime(timeStr) {
  if (!timeStr) return '';
  return timeStr.substring(0, 5);
}

/**
 * Format rating number
 * @param {number} rating
 * @returns {string}
 */
export function formatRating(rating) {
  if (typeof rating !== 'number' || isNaN(rating)) return '0.0';
  return rating.toFixed(1);
}

/**
 * Get initials from name
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  if (!name) return '?';

  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Format phone number to Brazilian format
 * @param {string} phone
 * @returns {string}
 */
export function formatPhone(phone) {
  if (!phone) return '';

  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 11) {
    // Mobile: (XX) XXXXX-XXXX
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    // Landline: (XX) XXXX-XXXX
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }

  return phone;
}

/**
 * Format date to relative time (e.g., "há 2 dias")
 * @param {string} dateStr
 * @returns {string}
 */
export function formatRelativeTime(dateStr) {
  if (!dateStr) return '';

  const date = new Date(dateStr);
  const now = new Date();
  const diffInMs = now - date;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHours === 0) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      if (diffInMinutes === 0) return 'agora';
      return `há ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
    }
    return `há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  } else if (diffInDays === 1) {
    return 'ontem';
  } else if (diffInDays < 7) {
    return `há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `há ${weeks} semana${weeks > 1 ? 's' : ''}`;
  } else {
    return formatDate(dateStr);
  }
}

/**
 * Format sport name to display
 * @param {string} sport
 * @returns {string}
 */
export function formatSport(sport) {
  const sportNames = {
    futebol: 'Futebol',
    futsal: 'Futsal',
    volei: 'Vôlei',
    basquete: 'Basquete',
    tenis: 'Tênis',
    beach_tennis: 'Beach Tennis',
    padel: 'Padel',
    handebol: 'Handebol'
  };
  return sportNames[sport] || sport;
}

/**
 * Truncate text with ellipsis
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

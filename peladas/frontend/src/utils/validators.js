/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export function validateEmail(email) {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validate password (minimum 8 characters)
 * @param {string} password
 * @returns {boolean}
 */
export function validatePassword(password) {
  if (!password) return false;
  return password.length >= 8;
}

/**
 * Validate phone number (Brazilian format)
 * @param {string} phone
 * @returns {boolean}
 */
export function validatePhone(phone) {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 11;
}

/**
 * Validate CPF (Brazilian tax ID)
 * @param {string} cpf
 * @returns {boolean}
 */
export function validateCPF(cpf) {
  if (!cpf) return false;

  const cleaned = cpf.replace(/\D/g, '');

  if (cleaned.length !== 11) return false;

  // Check for known invalid CPFs (all same digits)
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  // Validate first digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(9))) return false;

  // Validate second digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(10))) return false;

  return true;
}

/**
 * Validate required field
 * @param {string} value
 * @returns {boolean}
 */
export function validateRequired(value) {
  if (value === null || value === undefined) return false;
  return String(value).trim().length > 0;
}

/**
 * Validate minimum length
 * @param {string} value
 * @param {number} minLength
 * @returns {boolean}
 */
export function validateMinLength(value, minLength) {
  if (!value) return false;
  return String(value).trim().length >= minLength;
}

/**
 * Validate maximum length
 * @param {string} value
 * @param {number} maxLength
 * @returns {boolean}
 */
export function validateMaxLength(value, maxLength) {
  if (!value) return true;
  return String(value).trim().length <= maxLength;
}

/**
 * Validate date is in the future
 * @param {string} dateStr - ISO date string (YYYY-MM-DD)
 * @returns {boolean}
 */
export function validateFutureDate(dateStr) {
  if (!dateStr) return false;

  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return date >= today;
}

/**
 * Validate booking time slot
 * @param {string} dateStr
 * @param {string} timeSlot - HH:MM format
 * @returns {boolean}
 */
export function validateTimeSlot(dateStr, timeSlot) {
  if (!dateStr || !timeSlot) return false;

  const now = new Date();
  const slotDate = new Date(`${dateStr}T${timeSlot}:00`);

  return slotDate > now;
}

/**
 * Validate rating (1-5)
 * @param {number} rating
 * @returns {boolean}
 */
export function validateRating(rating) {
  if (typeof rating !== 'number') return false;
  return rating >= 1 && rating <= 5 && Number.isInteger(rating);
}

/**
 * Get validation error message
 * @param {string} field
 * @param {string} rule
 * @returns {string}
 */
export function getValidationError(field, rule) {
  const messages = {
    email: {
      required: 'E-mail é obrigatório',
      invalid: 'E-mail inválido'
    },
    password: {
      required: 'Senha é obrigatória',
      minLength: 'Senha deve ter pelo menos 8 caracteres'
    },
    name: {
      required: 'Nome é obrigatório',
      minLength: 'Nome deve ter pelo menos 2 caracteres'
    },
    phone: {
      required: 'Telefone é obrigatório',
      invalid: 'Telefone inválido'
    },
    cpf: {
      required: 'CPF é obrigatório',
      invalid: 'CPF inválido'
    },
    date: {
      required: 'Data é obrigatória',
      invalid: 'Data inválida',
      past: 'Data deve ser no futuro'
    },
    time: {
      required: 'Horário é obrigatório',
      invalid: 'Horário inválido',
      past: 'Horário deve ser no futuro'
    },
    rating: {
      required: 'Avaliação é obrigatória',
      invalid: 'Avaliação deve ser entre 1 e 5'
    },
    comment: {
      required: 'Comentário é obrigatório',
      minLength: 'Comentário deve ter pelo menos 10 caracteres'
    }
  };

  return messages[field]?.[rule] || 'Campo inválido';
}

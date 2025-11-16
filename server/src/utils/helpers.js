// server/src/utils/helpers.js

/**
 * Generate URL-friendly slug from title
 */
const generateSlug = (title) => {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-');      // Replace multiple hyphens with single
};

/**
 * Validate email format
 */
const validateEmail = (email) => {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize user input (remove HTML tags and trim)
 */
const sanitizeInput = (input) => {
  if (!input) return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags first
    .replace(/<[^>]*>/g, '') // Remove all other HTML tags
    .trim();
};

/**
 * Format date to readable string
 */
const formatDate = (date, format = 'default') => {
  if (!date || isNaN(new Date(date).getTime())) {
    return 'Invalid Date';
  }

  const dateObj = new Date(date);
  
  if (format === 'YYYY-MM-DD') {
    // Use UTC methods to avoid timezone issues
    const year = dateObj.getUTCFullYear();
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Default format: "Jan 15, 2024"
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  });
};

/**
 * Calculate reading time based on word count
 * Average reading speed: 200 words per minute
 */
const calculateReadingTime = (content, wordsPerMinute = 200) => {
  if (!content) return 0;
  
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  
  return minutes;
};

module.exports = {
  generateSlug,
  validateEmail,
  sanitizeInput,
  formatDate,
  calculateReadingTime,
};
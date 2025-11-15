// server/tests/unit/utils.test.js - Unit tests for utility functions

const {
  generateSlug,
  validateEmail,
  sanitizeInput,
  formatDate,
  calculateReadingTime,
} = require('../../src/utils/helpers');

describe('Utility Functions', () => {
  describe('generateSlug', () => {
    it('should convert title to lowercase slug', () => {
      const result = generateSlug('My Awesome Blog Post');
      expect(result).toBe('my-awesome-blog-post');
    });

    it('should handle special characters', () => {
      const result = generateSlug('Hello! This is a @Test#');
      expect(result).toBe('hello-this-is-a-test');
    });

    it('should handle multiple spaces', () => {
      const result = generateSlug('Too    Many     Spaces');
      expect(result).toBe('too-many-spaces');
    });

    it('should handle empty string', () => {
      const result = generateSlug('');
      expect(result).toBe('');
    });

    it('should handle non-English characters', () => {
      const result = generateSlug('Café and Naïve');
      expect(result).toMatch(/^[a-z0-9-]+$/);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@example.co.uk')).toBe(true);
      expect(validateEmail('test123@test-domain.com')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(validateEmail('notanemail')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('test @example.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });

    it('should handle null and undefined', () => {
      expect(validateEmail(null)).toBe(false);
      expect(validateEmail(undefined)).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      const result = sanitizeInput('<script>alert("xss")</script>Hello');
      expect(result).toBe('Hello');
    });

    it('should trim whitespace', () => {
      const result = sanitizeInput('  Hello World  ');
      expect(result).toBe('Hello World');
    });

    it('should handle empty input', () => {
      const result = sanitizeInput('');
      expect(result).toBe('');
    });

    it('should preserve safe text', () => {
      const result = sanitizeInput('Normal text content');
      expect(result).toBe('Normal text content');
    });
  });

  describe('formatDate', () => {
    it('should format date to readable string', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDate(date);
      expect(result).toContain('2024');
      expect(result).toContain('Jan');
    });

    it('should handle invalid dates', () => {
      const result = formatDate('invalid');
      expect(result).toBe('Invalid Date');
    });

    it('should accept custom format', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date, 'YYYY-MM-DD');
      expect(result).toBe('2024-01-15');
    });
  });

  describe('calculateReadingTime', () => {
    it('should calculate reading time for short content', () => {
      const content = 'This is a short piece of content with about twenty words in it for testing purposes okay.';
      const result = calculateReadingTime(content);
      expect(result).toBe(1); // Should round up to 1 minute
    });

    it('should calculate reading time for longer content', () => {
      const words = new Array(500).fill('word').join(' ');
      const result = calculateReadingTime(words);
      expect(result).toBeGreaterThan(1);
    });

    it('should handle empty content', () => {
      const result = calculateReadingTime('');
      expect(result).toBe(0);
    });

    it('should use default words per minute (200)', () => {
      const words = new Array(200).fill('word').join(' ');
      const result = calculateReadingTime(words);
      expect(result).toBe(1);
    });
  });
});

// Middleware tests
describe('Auth Middleware', () => {
  const { verifyToken } = require('../../src/middleware/auth');
  const jwt = require('jsonwebtoken');

  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it('should call next() with valid token', () => {
    const token = jwt.sign({ id: '123' }, process.env.JWT_SECRET || 'test-secret');
    mockReq.headers.authorization = `Bearer ${token}`;

    verifyToken(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user).toBeDefined();
  });

  it('should return 401 if no token provided', () => {
    verifyToken(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', () => {
    mockReq.headers.authorization = 'Bearer invalid-token';

    verifyToken(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });
});
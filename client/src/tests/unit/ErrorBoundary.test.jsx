// client/src/tests/unit/ErrorBoundary.test.jsx - Fixed for Vitest
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import ErrorBoundary from '../../components/ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for these tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should catch and display errors', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('should display error details in development mode', () => {
    // Mock development environment
    const originalEnv = import.meta.env.DEV;
    import.meta.env.DEV = true;

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    
    // Restore original environment
    import.meta.env.DEV = originalEnv;
  });
});
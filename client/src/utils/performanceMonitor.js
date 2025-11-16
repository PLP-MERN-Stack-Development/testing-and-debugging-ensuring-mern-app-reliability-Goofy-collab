// client/src/utils/performanceMonitor.js
import React from 'react';

// Measure performance of a function
export const measurePerformance = (metricName, callback) => {
  const start = performance.now();
  const result = callback();
  const end = performance.now();
  const duration = end - start;

  if (duration > 100) {
    console.warn(`Performance warning: ${metricName} took ${duration.toFixed(2)}ms`);
  }

  if (import.meta.env.DEV) {
    console.log(`${metricName}: ${duration.toFixed(2)}ms`);
  }

  return result;
};

// Measure API call performance
export const measureAPICall = async (apiName, apiCall) => {
  const start = performance.now();
  try {
    const result = await apiCall();
    const duration = performance.now() - start;
    
    console.log(`API Call ${apiName}: ${duration.toFixed(2)}ms`);
    
    if (duration > 2000) {
      console.warn(`Slow API call detected: ${apiName} took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`API Call ${apiName} failed after ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
};

// React component performance monitoring HOC
export const withPerformanceMonitoring = (Component, componentName) => {
  return class PerformanceMonitor extends React.Component {
    componentDidMount() {
      if (import.meta.env.DEV) {
        const mountTime = performance.now();
        console.log(`${componentName} mounted in ${mountTime.toFixed(2)}ms`);
      }
    }

    componentDidUpdate(prevProps, prevState) {
      if (import.meta.env.DEV) {
        const updateTime = performance.now();
        console.log(`${componentName} updated at ${updateTime.toFixed(2)}ms`);
      }
    }

    render() {
      return <Component {...this.props} />;
    }
  };
};

// Track page load time
export const trackPageLoad = () => {
  if (typeof window !== 'undefined' && window.performance) {
    window.addEventListener('load', () => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      
      console.log('Page Load Metrics:', {
        'Page Load Time': `${pageLoadTime}ms`,
        'DOM Content Loaded': `${perfData.domContentLoadedEventEnd - perfData.navigationStart}ms`,
        'DOM Interactive': `${perfData.domInteractive - perfData.navigationStart}ms`,
      });
    });
  }
};
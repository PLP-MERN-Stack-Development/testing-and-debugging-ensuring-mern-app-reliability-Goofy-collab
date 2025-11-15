export const measurePerformance = (metricName, callback) => {
  const start = performance.now();
  const result = callback();
  const end = performance.now();
  const duration = end - start;

  if (duration > 100) {
    console.warn(`Performance warning: ${metricName} took ${duration.toFixed(2)}ms`);
  }

  return result;
};

// React component performance monitoring
export const withPerformanceMonitoring = (Component, componentName) => {
  return class extends React.Component {
    componentDidMount() {
      const mountTime = performance.now();
      console.log(`${componentName} mounted in ${mountTime.toFixed(2)}ms`);
    }

    render() {
      return <Component {...this.props} />;
    }
  };
};
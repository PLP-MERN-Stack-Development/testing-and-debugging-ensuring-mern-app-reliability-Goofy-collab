import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        {/* Your app components */}
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
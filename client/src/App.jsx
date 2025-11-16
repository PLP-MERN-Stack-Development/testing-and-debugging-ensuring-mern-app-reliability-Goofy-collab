// client/src/App.jsx
import { useState } from 'react'
import PostsList from './components/PostsList'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

function App() {
  const [showPosts, setShowPosts] = useState(false);

  return (
    <ErrorBoundary>
      <div className="App">
        <h1>MERN Testing App</h1>
        
        <div style={{ marginBottom: '2rem' }}>
          <button 
            onClick={() => setShowPosts(!showPosts)}
            style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            {showPosts ? 'Hide Posts' : 'Show Posts'}
          </button>
        </div>

        {showPosts && <PostsList />}

        <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5' }}>
          <p><strong>Instructions:</strong></p>
          <ul style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
            <li>Make sure your server is running on port 5000</li>
            <li>Click "Show Posts" to fetch data from the API</li>
            <li>Open browser console (F12) to see performance logs</li>
            <li>API calls and component mount times are tracked automatically</li>
          </ul>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default App


// import React from 'react';
// import { BrowserRouter } from 'react-router-dom';
// import ErrorBoundary from './components/ErrorBoundary';
// import './App.css';

// function App() {
//   return (
//     <ErrorBoundary>
//       <BrowserRouter>
//         {/* Your app components */}
//       </BrowserRouter>
//     </ErrorBoundary>
//   );
// }

// export default App;
import React from 'react';
import ComprehensivePortalApp from './ComprehensivePortalApp';
import AuthProvider from '../AuthContext';

function App() {
  return (
    <AuthProvider>
      <ComprehensivePortalApp />
    </AuthProvider>
  );
}

export default App;
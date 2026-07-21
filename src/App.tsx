import React from 'react';
import ComprehensivePortalApp from './ComprehensivePortalApp';
import AuthProvider from '../AuthContext';
import { NativeSecurityProvider } from './components/NativeSecurityProvider';

function App() {
  return (
    <AuthProvider>
      <NativeSecurityProvider>
        <ComprehensivePortalApp />
      </NativeSecurityProvider>
    </AuthProvider>
  );
}

export default App;
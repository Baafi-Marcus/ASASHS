// AuthContext.tsx
import React, { createContext, useState } from 'react';
import supabase from '../lib/supabase';

interface AuthContextProps {
  user: any;
  signIn: (email: string, password: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextProps>({});

const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState(null);

  const signIn = async (email: string, password: string) => {
    const { user, error } = await supabase.auth.signIn({ email, password });
    if (error) {
      console.error(error);
    } else {
      setUser(user);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
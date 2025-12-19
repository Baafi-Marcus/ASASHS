// AuthContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import { db } from './lib/neon';
import toast from 'react-hot-toast';

interface User {
  id: number;
  user_id: string;
  user_type: 'admin' | 'student' | 'teacher';
  full_name: string;
  role: string;
  must_change_password?: boolean;
  student_id?: string;
  teacher_id?: string;
  admission_number?: string;
  staff_id?: string;
}

interface AuthContextProps {
  user: User | null;
  signIn: (userId: string, password: string) => Promise<void>;
  signOut: () => void;
  changePassword: (newPassword: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  signIn: async () => {},
  signOut: () => {},
  changePassword: async () => {},
  loading: false,
});

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const savedUser = localStorage.getItem('asashs_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('asashs_user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (userId: string, password: string) => {
    try {
      setLoading(true);
      
      // For admin, allow email login for backward compatibility
      if (userId === 'admin@asashs.edu.gh') {
        userId = 'ADMIN001';
      }
      
      const authenticatedUser = await db.authenticateUser(userId, password);
      
      if (!authenticatedUser) {
        toast.error('Invalid credentials. Please check your ID and password.');
        return;
      }
      
      setUser(authenticatedUser);
      localStorage.setItem('asashs_user', JSON.stringify(authenticatedUser));
      
      if (authenticatedUser.must_change_password) {
        toast.success('Login successful! Please change your password.');
      } else {
        toast.success(`Welcome back, ${authenticatedUser.full_name}!`);
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast.error('Login failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (newPassword: string) => {
    if (!user) {
      toast.error('No user logged in');
      return;
    }
    
    try {
      await db.changePassword(user.user_id, newPassword);
      
      // Update user state
      const updatedUser = { ...user, must_change_password: false };
      setUser(updatedUser);
      localStorage.setItem('asashs_user', JSON.stringify(updatedUser));
      
      toast.success('Password changed successfully!');
    } catch (error: any) {
      console.error('Password change error:', error);
      toast.error('Failed to change password. Please try again.');
      throw error;
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('asashs_user');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, changePassword, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
export default AuthProvider;
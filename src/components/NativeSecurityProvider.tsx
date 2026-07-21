import React, { createContext, useContext, useState, useEffect } from 'react';
import { nativeSecurity } from '../services/nativeSecurity';
import toast from 'react-hot-toast';

interface NativeSecurityContextType {
  isLockedDown: boolean;
  violationsCount: number;
  startLockdown: (onMaxViolationsReached?: () => void) => Promise<void>;
  stopLockdown: () => Promise<void>;
}

const NativeSecurityContext = createContext<NativeSecurityContextType | null>(null);

export function NativeSecurityProvider({ children }: { children: React.ReactNode }) {
  const [isLockedDown, setIsLockedDown] = useState(false);
  const [violationsCount, setViolationsCount] = useState(0);

  const startLockdown = async (onMaxViolationsReached?: () => void) => {
    setIsLockedDown(true);
    setViolationsCount(0);

    await nativeSecurity.startMonitoring((type) => {
      setViolationsCount((prev) => {
        const next = prev + 1;
        toast.error(`⚠️ Security Warning (${next}/3): ${type === 'background' ? 'App switched to background/split screen' : 'Tab/window switch detected'}. Please stay inside the assessment!`, {
          duration: 5000,
          style: { border: '2px solid red', background: '#fff0f0', color: '#900', fontWeight: 'bold' }
        });

        if (next >= 3 && onMaxViolationsReached) {
          toast.error('🚫 Maximum security violations exceeded! Auto-submitting assessment.', { duration: 6000 });
          onMaxViolationsReached();
        }
        return next;
      });
    });
  };

  const stopLockdown = async () => {
    setIsLockedDown(false);
    await nativeSecurity.stopMonitoring();
  };

  useEffect(() => {
    return () => {
      nativeSecurity.stopMonitoring();
    };
  }, []);

  return (
    <NativeSecurityContext.Provider value={{ isLockedDown, violationsCount, startLockdown, stopLockdown }}>
      {children}
    </NativeSecurityContext.Provider>
  );
}

export function useNativeSecurity() {
  const context = useContext(NativeSecurityContext);
  if (!context) {
    throw new Error('useNativeSecurity must be used within a NativeSecurityProvider');
  }
  return context;
}

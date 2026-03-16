import { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';

interface DemoContextType {
  isDemoMode: boolean;
  demoUser: User | null;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const useDemoMode = () => {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
};

// Simulated demo user
const DEMO_USER: User = {
  id: 'demo-user-123',
  email: 'demo@writemuse.pro',
  app_metadata: {},
  user_metadata: { full_name: 'Demo User' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as User;

export const DemoModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Check if demo mode was previously enabled
    const demoEnabled = localStorage.getItem('demoModeEnabled');
    if (demoEnabled === 'true') {
      setIsDemoMode(true);
    }
  }, []);

  const enableDemoMode = () => {
    setIsDemoMode(true);
    localStorage.setItem('demoModeEnabled', 'true');
  };

  const disableDemoMode = () => {
    setIsDemoMode(false);
    localStorage.removeItem('demoModeEnabled');
  };

  return (
    <DemoContext.Provider value={{
      isDemoMode,
      demoUser: isDemoMode ? DEMO_USER : null,
      enableDemoMode,
      disableDemoMode,
    }}>
      {children}
    </DemoContext.Provider>
  );
};

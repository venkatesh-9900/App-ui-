import React, { createContext, useContext, useEffect, useState } from 'react';

interface AppearanceSettings {
  messageBubbles: boolean;
  compactMode: boolean;
  largeFont: boolean;
}

interface AppearanceContextType {
  settings: AppearanceSettings;
  updateSettings: (key: keyof AppearanceSettings, value: boolean) => void;
}

const defaultSettings: AppearanceSettings = {
  messageBubbles: true,
  compactMode: true,
  largeFont: false,
};

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppearanceSettings>(() => {
    const saved = localStorage.getItem('appearanceSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('appearanceSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (key: keyof AppearanceSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AppearanceContext.Provider value={{ settings, updateSettings }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const context = useContext(AppearanceContext);
  if (context === undefined) {
    throw new Error('useAppearance must be used within an AppearanceProvider');
  }
  return context;
}
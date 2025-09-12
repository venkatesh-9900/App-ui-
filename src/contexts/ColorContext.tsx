import React, { createContext, useContext, useEffect, useState } from 'react';

// Color HSL values mapping
const colorValues = {
  indigo: { h: '238', s: '83%', l: '60%' },
  violet: { h: '265', s: '83%', l: '60%' },
  emerald: { h: '152', s: '76%', l: '44%' },
  amber: { h: '43', s: '96%', l: '56%' },
  rose: { h: '340', s: '82%', l: '59%' },
  sky: { h: '199', s: '89%', l: '48%' },
  teal: { h: '172', s: '66%', l: '50%' },
  fuchsia: { h: '292', s: '84%', l: '60%' },
  cyan: { h: '186', s: '94%', l: '50%' },
};

type ColorContextType = {
  accentColor: string;
  setAccentColor: (color: string) => void;
};

const ColorContext = createContext<ColorContextType | undefined>(undefined);

export function ColorProvider({ children }: { children: React.ReactNode }) {
  const [accentColor, setAccentColor] = useState(() => {
    const saved = localStorage.getItem('accentColor');
    return saved || 'indigo';
  });

  useEffect(() => {
    localStorage.setItem('accentColor', accentColor);
    
    const color = colorValues[accentColor as keyof typeof colorValues];
    if (color) {
      // Set primary colors
      document.documentElement.style.setProperty('--primary', `${color.h} ${color.s} ${color.l}`);
      document.documentElement.style.setProperty('--primary-foreground', '0 0% 98%');
      
      // Set accent colors
      document.documentElement.style.setProperty('--accent', `${color.h} ${color.s} ${color.l}`);
      document.documentElement.style.setProperty('--accent-foreground', '0 0% 98%');
    }
  }, [accentColor]);

  return (
    <ColorContext.Provider value={{ accentColor, setAccentColor }}>
      {children}
    </ColorContext.Provider>
  );
}

export function useColor() {
  const context = useContext(ColorContext);
  if (context === undefined) {
    throw new Error('useColor must be used within a ColorProvider');
  }
  return context;
}
import React, { createContext, useContext, useState, useEffect } from 'react';

type Direction = 'ltr' | 'rtl';

interface RTLContextType {
  direction: Direction;
  setDirection: (direction: Direction) => void;
}

const RTLContext = createContext<RTLContextType | undefined>(undefined);

export function RTLProvider({ children }: { children: React.ReactNode }) {
  const [direction, setDirection] = useState<Direction>(() => {
    const saved = localStorage.getItem('direction');
    return (saved as Direction) || 'ltr';
  });

  useEffect(() => {
    document.dir = direction;
    localStorage.setItem('direction', direction);
  }, [direction]);

  return (
    <RTLContext.Provider value={{ direction, setDirection }}>
      {children}
    </RTLContext.Provider>
  );
}

export function useRTL() {
  const context = useContext(RTLContext);
  if (context === undefined) {
    throw new Error('useRTL must be used within a RTLProvider');
  }
  return context;
}
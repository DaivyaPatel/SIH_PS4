import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getStoredItem, setStoredItem } from '../lib/storage';

export type Density = 'comfortable' | 'compact';

interface DensityContextType {
  density: Density;
  setDensity: (density: Density) => void;
  toggleDensity: () => void;
}

const DensityContext = createContext<DensityContextType | undefined>(undefined);

export function DensityProvider({ children }: { children: ReactNode }) {
  const [density, setDensityState] = useState<Density>(() => {
    const saved = getStoredItem('aicte_density');
    return saved === 'compact' ? 'compact' : 'comfortable';
  });

  useEffect(() => {
    setStoredItem('aicte_density', density);
  }, [density]);

  const toggleDensity = () => {
    setDensityState(prev => (prev === 'comfortable' ? 'compact' : 'comfortable'));
  };

  const setDensity = (newDensity: Density) => {
    setDensityState(newDensity);
  };

  return (
    <DensityContext.Provider value={{ density, toggleDensity, setDensity }}>
      {children}
    </DensityContext.Provider>
  );
}

export function useDensity() {
  const context = useContext(DensityContext);
  if (!context) {
    throw new Error('useDensity must be used within a DensityProvider');
  }
  return context;
}


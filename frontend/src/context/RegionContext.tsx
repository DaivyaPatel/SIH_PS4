import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Region } from '../types/domain';
import { getStoredItem, setStoredItem } from '../lib/storage';

export type SelectedRegion = Region | 'ALL';

interface RegionContextType {
  selectedRegion: SelectedRegion;
  setSelectedRegion: (region: SelectedRegion) => void;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export function RegionProvider({ children }: { children: ReactNode }) {
  const [selectedRegion, setSelectedRegionState] = useState<SelectedRegion>(() => {
    const saved = getStoredItem('aicte_region');
    if (saved && ['ALL', 'WRO', 'SRO', 'NRO', 'ERO', 'CRO'].includes(saved)) {
      return saved as SelectedRegion;
    }
    return 'ALL';
  });

  const setSelectedRegion = (reg: SelectedRegion) => {
    setSelectedRegionState(reg);
    setStoredItem('aicte_region', reg);
  };

  return (
    <RegionContext.Provider value={{ selectedRegion, setSelectedRegion }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
}

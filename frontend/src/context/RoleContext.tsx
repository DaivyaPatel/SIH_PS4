import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Role } from '../types/domain';
import { getStoredItem, setStoredItem } from '../lib/storage';

interface Permissions {
  canApprove: boolean;
  canReject: boolean;
  canFlagDeficiency: boolean;
  canResolveDeficiency: boolean;
  canRespondDeficiency: boolean;
  canScheduleEVC: boolean;
  canExtendDeadline: boolean;
  canViewAudit: boolean;
  roleDisplayName: string;
}

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  permissions: Permissions;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(() => {
    const saved = getStoredItem('aicte_role');
    if (saved && ['REGIONAL_OFFICER', 'SCRUTINY_OFFICER', 'INSTITUTION_ADMIN', 'EVC_EXPERT'].includes(saved)) {
      return saved as Role;
    }
    return 'REGIONAL_OFFICER';
  });

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    setStoredItem('aicte_role', newRole);
  };

  const permissions: Permissions = {
    canApprove: role === 'REGIONAL_OFFICER',
    canReject: role === 'REGIONAL_OFFICER',
    canFlagDeficiency: role === 'SCRUTINY_OFFICER' || role === 'REGIONAL_OFFICER',
    canResolveDeficiency: role === 'SCRUTINY_OFFICER' || role === 'REGIONAL_OFFICER',
    canRespondDeficiency: role === 'INSTITUTION_ADMIN',
    canScheduleEVC: role === 'REGIONAL_OFFICER',
    canExtendDeadline: role === 'REGIONAL_OFFICER',
    canViewAudit: true,
    roleDisplayName:
      role === 'REGIONAL_OFFICER'
        ? 'Regional Officer'
        : role === 'SCRUTINY_OFFICER'
        ? 'Scrutiny Officer'
        : role === 'INSTITUTION_ADMIN'
        ? 'Institution Representative'
        : 'Expert Committee Member',
  };

  return (
    <RoleContext.Provider value={{ role, setRole, permissions }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

export function usePermissions(): Permissions {
  const { permissions } = useRole();
  return permissions;
}

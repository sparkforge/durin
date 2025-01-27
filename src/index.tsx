import { createContext, useContext, ReactNode, FC } from 'react';

// Define types for permissions and roles
type Permission = string;
type Role = {
  name: string;
  permissions: Permission[];
};

interface PermissionContextType {
  hasPermission: (permission: Permission) => boolean;
  hasRole: (roleName: string) => boolean;
  userRoles: Role[];
}

// Create context
const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

// Props interface for the provider
interface PermissionProviderProps {
  children: ReactNode;
  roles: Role[];
  userRoles: string[];
}

// Provider component
export const PermissionProvider: FC<PermissionProviderProps> = ({
  children,
  roles,
  userRoles,
}) => {
  // Get all roles assigned to the user
  const assignedRoles = roles.filter(role => userRoles.includes(role.name));

  // Check if user has a specific permission
  const hasPermission = (permission: Permission): boolean => {
    return assignedRoles.some(role => role.permissions.includes(permission));
  };

  // Check if user has a specific role
  const hasRole = (roleName: string): boolean => {
    return userRoles.includes(roleName);
  };

  const value = {
    hasPermission,
    hasRole,
    userRoles: assignedRoles
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

// Custom hook to use permissions
export const usePermissions = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

// Protected component wrapper
interface ProtectedProps {
  children: ReactNode;
  requiredPermission?: Permission;
  requiredRole?: string;
  fallback?: ReactNode;
}

export const Protected: FC<ProtectedProps> = ({
  children,
  requiredPermission,
  requiredRole,
  fallback = null,
}) => {
  const { hasPermission, hasRole } = usePermissions();

  const hasAccess = 
    (requiredPermission ? hasPermission(requiredPermission) : true) &&
    (requiredRole ? hasRole(requiredRole) : true);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

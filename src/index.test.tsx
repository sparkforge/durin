import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, renderHook } from '@testing-library/react';
import { PermissionProvider, usePermissions, Protected } from './index';

// Test data
const testRoles = [
  {
    name: 'admin',
    permissions: ['create:users', 'edit:users', 'delete:users']
  },
  {
    name: 'editor',
    permissions: ['edit:users']
  },
  {
    name: 'viewer',
    permissions: ['view:users']
  }
];

describe('PermissionProvider', () => {
  it('renders children without crashing', () => {
    render(
      <PermissionProvider roles={testRoles} userRoles={['admin']}>
        <div data-testid="child">Child Component</div>
      </PermissionProvider>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});

describe('usePermissions Hook', () => {
  const wrapper = ({ children, userRoles = ['editor'] }) => (
    <PermissionProvider roles={testRoles} userRoles={userRoles}>
      {children}
    </PermissionProvider>
  );

  it('throws error when used outside of PermissionProvider', () => {
    expect(() => renderHook(() => usePermissions())).toThrow(
      'usePermissions must be used within a PermissionProvider'
    );
  });

  it('correctly checks for permissions', () => {
    const { result } = renderHook(() => usePermissions(), { 
      wrapper: ({ children }) => wrapper({ children }) 
    });
    
    expect(result.current.hasPermission('edit:users')).toBe(true);
    expect(result.current.hasPermission('delete:users')).toBe(false);
  });

  it('correctly checks for roles', () => {
    const { result } = renderHook(() => usePermissions(), { 
      wrapper: ({ children }) => wrapper({ children }) 
    });
    
    expect(result.current.hasRole('editor')).toBe(true);
    expect(result.current.hasRole('admin')).toBe(false);
  });

  it('handles multiple roles correctly', () => {
    const { result } = renderHook(() => usePermissions(), {
      wrapper: ({ children }) => wrapper({ 
        children, 
        userRoles: ['editor', 'viewer'] 
      })
    });

    expect(result.current.hasPermission('edit:users')).toBe(true);
    expect(result.current.hasPermission('view:users')).toBe(true);
    expect(result.current.hasPermission('delete:users')).toBe(false);
  });
});

describe('Protected Component', () => {
  const wrapper = ({ children, userRoles = ['editor'] }) => (
    <PermissionProvider roles={testRoles} userRoles={userRoles}>
      {children}
    </PermissionProvider>
  );

  it('renders children when permission is granted', () => {
    render(
      <Protected requiredPermission="edit:users">
        <div data-testid="protected-content">Protected Content</div>
      </Protected>,
      { wrapper: ({ children }) => wrapper({ children }) }
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('renders fallback when permission is denied', () => {
    render(
      <Protected 
        requiredPermission="delete:users"
        fallback={<div data-testid="fallback">Access Denied</div>}
      >
        <div data-testid="protected-content">Protected Content</div>
      </Protected>,
      { wrapper: ({ children }) => wrapper({ children }) }
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('fallback')).toBeInTheDocument();
  });

  it('handles role-based protection', () => {
    render(
      <Protected requiredRole="admin">
        <div data-testid="protected-content">Admin Only</div>
      </Protected>,
      { wrapper: ({ children }) => wrapper({ children }) }
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('handles combined permission and role checks', () => {
    const { rerender } = render(
      <Protected 
        requiredPermission="edit:users"
        requiredRole="editor"
      >
        <div data-testid="protected-content">Editor Content</div>
      </Protected>,
      { wrapper: ({ children }) => wrapper({ children }) }
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();

    // Test with missing role
    rerender(
      <Protected 
        requiredPermission="edit:users"
        requiredRole="admin"
      >
        <div data-testid="protected-content">Editor Content</div>
      </Protected>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('handles empty roles array', () => {
    render(
      <Protected requiredPermission="edit:users">
        <div data-testid="protected-content">Protected Content</div>
      </Protected>,
      { 
        wrapper: ({ children }) => wrapper({ children, userRoles: [] }) 
      }
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
});

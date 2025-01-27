# 🚪 Durin

> Speak friend and enter: A lightweight TypeScript-based permissions guardian for React applications

[![npm version](https://badge.fury.io/js/durin.svg)](https://badge.fury.io/js/durin)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

## Features

- 🎯 Simple, lightweight role-based access control
- 🔒 Type-safe permission management
- ⚛️ React-first design
- 🪶 Zero dependencies
- 📦 Tree-shakeable
- 🧪 Thoroughly tested

## Installation

```bash
npm install durin
# or
yarn add durin
# or
pnpm add durin
```

## Quick Start

```tsx
import { PermissionProvider, Protected, usePermissions } from 'durin';

// Define your roles and permissions
const roles = [
  {
    name: 'admin',
    permissions: ['create:users', 'edit:users', 'delete:users']
  },
  {
    name: 'editor',
    permissions: ['edit:users']
  }
];

// Wrap your app with the provider
function App() {
  const userRoles = ['editor']; // Get this from your auth system

  return (
    <PermissionProvider roles={roles} userRoles={userRoles}>
      <YourApp />
    </PermissionProvider>
  );
}

// Use the Protected component
function UserManagement() {
  return (
    <div>
      <Protected 
        requiredPermission="edit:users"
        fallback={<p>Access denied</p>}
      >
        <EditUserForm />
      </Protected>
    </div>
  );
}

// Or use the hook directly
function AdminPanel() {
  const { hasPermission, hasRole } = usePermissions();

  if (!hasRole('admin')) {
    return <p>Admin access required</p>;
  }

  return <div>Admin Panel Content</div>;
}
```

## API Reference

### `PermissionProvider`

The root provider component that manages permissions state.

#### Props

```typescript
{
  roles: Array<{
    name: string;
    permissions: string[];
  }>;
  userRoles: string[];
  children: ReactNode;
}
```

### `Protected`

A component wrapper that conditionally renders based on permissions.

#### Props

```typescript
{
  requiredPermission?: string;
  requiredRole?: string;
  fallback?: ReactNode;
  children: ReactNode;
}
```

### `usePermissions`

A hook for programmatically checking permissions.

```typescript
const {
  hasPermission: (permission: string) => boolean,
  hasRole: (role: string) => boolean,
  userRoles: Array<{ name: string; permissions: string[] }>
} = usePermissions();
```

## Best Practices

1. **Define Clear Permission Names**
   - Use colon-separated format: `resource:action`
   - Example: `users:create`, `posts:edit`

2. **Role Hierarchies**
   - Keep role structures flat when possible
   - Include all required permissions explicitly

3. **Error Handling**
   - Always provide fallback content
   - Handle loading states appropriately

4. **Type Safety**
   - Define permission and role types
   - Use string literals for better type inference

## Examples

### Nested Permissions

```tsx
<Protected requiredPermission="users:edit">
  <div>
    <h1>User Settings</h1>
    <Protected requiredPermission="users:delete">
      <DeleteUserButton />
    </Protected>
  </div>
</Protected>
```

### Combined Role and Permission Checks

```tsx
<Protected 
  requiredRole="admin"
  requiredPermission="settings:edit"
>
  <AdminSettings />
</Protected>
```

### Dynamic Permissions

```tsx
function FeatureFlag({ feature, children }) {
  const { hasPermission } = usePermissions();
  return hasPermission(`feature:${feature}`) ? children : null;
}
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Run the tests (`npm test`)
5. Submit a pull request

## License

MIT © [SparkForge]

---

"Not all those who wander are lost, but some just don't have the right permissions." - Gandalf, probably

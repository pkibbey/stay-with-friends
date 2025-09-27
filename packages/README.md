# Shared Packages

This directory contains shared packages for the Stay With Friends monorepo. These packages provide common functionality, types, and configurations that are used across both frontend and backend applications.

## Package Structure

### 📦 `@stay-with-friends/shared-types`

**Purpose**: Single source of truth for all entity definitions, types, and validation schemas.

**Key Features**:
- Zod-based entity schemas with runtime validation
- Automatic type generation for both backend (snake_case) and frontend (camelCase)
- Validation utilities and safe parsing functions
- Transformation utilities for backend/frontend compatibility

**Exports**:
```typescript
// Entity schemas
import { UserSchema, HostSchema, ENTITIES, SCHEMAS } from '@stay-with-friends/shared-types';

// Types
import { User, Host, Availability } from '@stay-with-friends/shared-types';

// Validation utilities
import { validate, safeParse, validateEmail } from '@stay-with-friends/shared-types';

// Transformations
import { transformToFrontend, transformToBackend } from '@stay-with-friends/shared-types';
```

### 🛠️ `@stay-with-friends/shared-utils`

**Purpose**: Common utility functions for date handling, validation, and data manipulation.

**Key Features**:
- Date utilities with consistent formatting
- Validation helpers (email, UUID, etc.)
- String manipulation utilities
- Array and object utilities
- Retry and debounce utilities

**Exports**:
```typescript
// Date utilities
import { formatDate, parseDate, getDaysInRange } from '@stay-with-friends/shared-utils/date';

// Validation utilities
import { isValidEmail, isValidUUID, sanitizeString } from '@stay-with-friends/shared-utils/validation';

// Or import everything
import { formatDate, isValidEmail, unique, retry } from '@stay-with-friends/shared-utils';
```

### ⚙️ `@stay-with-friends/shared-config`

**Purpose**: Shared configuration files for consistent tooling across all apps and packages.

**Key Features**:
- ESLint configurations for backend and frontend
- TypeScript configurations
- Jest configurations
- Standardized linting and formatting rules

**Usage**:
```javascript
// eslint.config.mjs
const { backend } = require('@stay-with-friends/shared-config/eslint');
module.exports = backend;

// jest.config.js  
const { frontend } = require('@stay-with-friends/shared-config/jest');
module.exports = frontend;

// tsconfig.json
{
  "extends": "@stay-with-friends/shared-config/typescript.json",
  "compilerOptions": {
    // Override specific settings
  }
}
```

## Benefits of This Structure

### 🎯 **Single Source of Truth**
- All entity definitions live in one place
- Type changes propagate automatically to all apps
- Consistent validation rules across frontend and backend

### 🔄 **Code Reuse**
- Common utilities are shared, not duplicated
- Consistent date formatting and validation logic
- Shared configuration reduces maintenance overhead

### 🛡️ **Type Safety**
- Runtime validation with Zod ensures data integrity
- TypeScript types are automatically generated and consistent
- Catch type mismatches at build time

### 🚀 **Developer Experience**
- Auto-completion works across all apps
- Easy to add new fields or entities
- Consistent coding standards via shared configs

### 📦 **Dependency Management**
- Clear separation of concerns
- Apps only depend on what they need
- Easier to version and update shared code

## Development Workflow

### Adding a New Entity

1. **Define the entity** in `packages/shared-types/src/entities.ts`:
```typescript
export const MyNewEntity = {
  table: 'my_new_table',
  fields: {
    id: StringField({ primary: true }),
    name: StringField(),
    created_at: DateTimeField({ default: 'CURRENT_TIMESTAMP' }),
  }
};
```

2. **Add to entity collection**:
```typescript
export const ENTITIES = {
  // ... existing entities
  MyNewEntity,
};
```

3. **Generate types**:
```bash
npm run generate
```

4. **Use in your apps**:
```typescript
import { MyNewEntity, validate } from '@stay-with-friends/shared-types';

// In backend
const data = validate.mynewentity(input);

// In frontend
const transformed = transformMyNewEntity(backendData);
```

### Adding Utility Functions

1. **Add to appropriate file** in `packages/shared-utils/src/`:
```typescript
// In validation.ts or date.ts
export const myNewUtility = (input: string): boolean => {
  // Implementation
};
```

2. **Export from index**:
```typescript
// In packages/shared-utils/src/index.ts
export { myNewUtility } from './validation';
```

3. **Build the package**:
```bash
cd packages/shared-utils && npm run build
```

4. **Use in apps**:
```typescript
import { myNewUtility } from '@stay-with-friends/shared-utils';
```

### Updating Configurations

1. **Modify config files** in `packages/shared-config/`
2. **Apps will pick up changes** on next build/lint run
3. **No need to sync configs** across multiple files

## Migration Notes

The shared packages are **backward compatible** with existing code:

1. ✅ **Existing imports still work** - no breaking changes
2. 🔄 **Gradual adoption** - you can start using shared packages incrementally
3. 🎯 **Enhanced features** - get runtime validation and better utilities when ready

## Testing

Each shared package includes its own test suite:

```bash
# Test all packages
npm test

# Test specific package
cd packages/shared-types && npm test
cd packages/shared-utils && npm test
```

## Build Pipeline

The packages are built in dependency order using Turbo:

```bash
# Build all packages and apps
npm run build

# Build only packages
turbo build --filter="packages/*"
```

The build process ensures:
1. **Shared packages build first** before apps that depend on them
2. **Type checking** across package boundaries
3. **Incremental builds** only rebuild what changed

---

This shared package structure provides a solid foundation for scaling the monorepo while maintaining consistency and developer productivity.
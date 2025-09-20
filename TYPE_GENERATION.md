# Type Generation System

This project now has an automated type generation system that creates consistent TypeScript types for both backend and frontend from a single schema definition.

## How it works

1. **Schema Definition**: All entity schemas are defined in `schema/models.json`
2. **Type Generation**: Run `npm run generate` from the root to generate types for both backend and frontend
3. **Generated Files**:
   - Backend: `apps/backend/src/generated/types.ts` (snake_case fields, number IDs)
   - Frontend: `apps/frontend/src/generated/types.ts` (camelCase fields, string IDs)
   - Transformers: `apps/frontend/src/generated/transformers.ts` (conversion utilities)

## Usage

### In Backend Code

```typescript
import { Host, User } from './generated/types';

// Types match the database schema exactly (snake_case)
const host: Host = {
  id: 1,
  user_id: 123,
  name: "John's Place",
  zip_code: "12345",
  check_in_time: "15:00",
  // ...
};
```

### In Frontend Code

```typescript
import { Host, User } from '../generated/types';
import { transformHost } from '../generated/transformers';

// Types use camelCase for better JavaScript/React compatibility
const host: Host = {
  id: "1",
  userId: "123", 
  name: "John's Place",
  zipCode: "12345",
  checkInTime: "15:00",
  // ...
};

// Transform backend data to frontend format
const backendHost = await fetch('/api/hosts/1').then(r => r.json());
const frontendHost = transformHost(backendHost);
```

### Adding New Fields

1. Update `schema/models.json`:
   ```json
   {
     "entities": {
       "Host": {
         "fields": {
           "new_field": { "type": "string", "nullable": true }
         }
       }
     }
   }
   ```

2. Run `npm run generate`

3. Types are automatically updated in both backend and frontend!

### Advanced Schema Configuration

- **JSON Fields**: Use `"jsonType": "string[]"` to specify the TypeScript type for JSON fields
- **Field Types**: 
  - `"integer"` → `number` (backend), `string` for IDs (frontend)
  - `"real"` → `number`
  - `"datetime"` → `string`
  - `"json"` → Uses `jsonType` or defaults to `any`

### Scripts

- `npm run generate` (root): Generate all types
- `npm run generate` (backend): Generate types from backend directory
- `npm run generate` (frontend): Generate types from frontend directory

## Benefits

✅ **Single Source of Truth**: Schema defined once, types generated everywhere
✅ **Type Safety**: Full TypeScript support across backend and frontend
✅ **Consistency**: Automatic field name transformations (snake_case ↔ camelCase)
✅ **ID Compatibility**: String IDs in frontend for better compatibility
✅ **Easy Maintenance**: Add fields once, get types everywhere
✅ **Transformation Utilities**: Built-in functions to convert between formats

## Migration Strategy

The generated types are designed to be gradually adopted:

1. Start using generated types for new features
2. Use transformation utilities when interfacing between backend and frontend
3. Gradually migrate existing manual type definitions
4. Remove manual types once fully migrated

The legacy types in `apps/frontend/src/types/host.ts` can be removed once all components are migrated to use the generated types.
# Enhanced Type Generation System

This project has an **enhanced automated type generation system** that creates consistent TypeScript types with **Zod runtime validation** for both backend and frontend from a single schema definition.

## How it works

1. **Schema Definition**: All entity schemas are defined in `schema/entities.ts` using Zod
2. **Enhanced Generation**: Run `npm run generate` from the root to generate types with validation
3. **Generated Files**:
   - Backend: `apps/backend/src/generated/types.ts` (snake_case fields + Zod schemas)
   - Frontend: `apps/frontend/src/generated/types.ts` (camelCase fields + validation utilities)
   - GraphQL: `apps/backend/src/generated/schema.graphql` (auto-generated)
   - SQL: `apps/backend/src/generated/schema.sql` (auto-generated)

## Key Enhancements

✅ **Zod Runtime Validation**: Every type has a corresponding Zod schema  
✅ **Safe Transformations**: Built-in `safeTransform*` functions with error handling  
✅ **Validation Helpers**: `validate.host(data)` and `safeParse.user(data)` utilities  
✅ **Form Integration Ready**: Works with `zodResolver` for React Hook Form  
✅ **Better Error Messages**: Clear validation errors instead of runtime crashes

## Usage

### In Backend Code (with Validation)

```typescript
import { Host, HostSchema, validate } from './generated/types';

// Validate input data at runtime
const createHost = async (input: unknown) => {
  const validatedHost = validate.host(input); // ✅ Throws if invalid
  
  // Now you know the data is valid and properly typed!
  const result = insertHost.run(validatedHost);
  return result;
};

// Alternative: Safe parsing (doesn't throw)
const safeResult = safeParse.host(input);
if (safeResult.success) {
  console.log(safeResult.data); // ✅ Properly typed Host
} else {
  console.error(safeResult.error.message); // ✅ Clear error message
}
```

### In Frontend Code (with Safe Transformations)

```typescript
import { Host, safeTransformHost, HostSchema } from '../generated/types';
import { zodResolver } from '@hookform/resolvers/zod';

// Automatic form validation
const form = useForm<Host>({
  resolver: zodResolver(HostSchema) // ✅ Auto-generated schema!
});

// Safe transformation from API data
const handleApiResponse = async () => {
  const backendHost = await fetch('/api/hosts/1').then(r => r.json());
  
  const transformResult = safeTransformHost(backendHost);
  if (transformResult.success) {
    setHost(transformResult.data); // ✅ Properly typed & validated
  } else {
    setError(transformResult.error); // ✅ Clear error message
  }
};
```

### Adding New Fields

1. Update `schema/entities.ts`:
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

✅ **Single Source of Truth**: Schema defined once, types + validation generated everywhere  
✅ **Runtime Safety**: Zod schemas catch errors before they cause problems  
✅ **Type Safety**: Full TypeScript support + runtime validation  
✅ **Consistency**: Automatic field name transformations (snake_case ↔ camelCase)  
✅ **Error Handling**: Safe transformations with clear error messages  
✅ **Form Integration**: Works with React Hook Form's `zodResolver`  
✅ **Easy Maintenance**: Add fields once, get types + validation everywhere  

## Migration Strategy

The enhanced types are **backward compatible** with your existing code:

1. ✅ **Immediate**: All existing imports keep working
2. 🚀 **Gradual Enhancement**: Add validation where needed (`validate.host(data)`)
3. 🎯 **Form Integration**: Use `zodResolver(HostSchema)` for form validation
4. 🛡️ **API Safety**: Use `safeTransformHost(apiData)` for safe transformations

No breaking changes - just additional superpowers when you need them!
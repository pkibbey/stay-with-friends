# Enhanced Type Generation System

This project has an **enhanced automated type generation system** that creates consistent TypeScript types with **Zod runtime validation** for both backend and frontend from a single schema definition.

## How it works

1. **Schema Definition**: All entity schemas are defined in `packages/shared-types/src/entities.ts` using Zod
2. **Enhanced Generation**: Types and validation are imported directly from the shared package—no GraphQL or Apollo code is generated or required.
3. **Generated Files**:
  - No generated GraphQL or Apollo files. All types and validation are shared via the package.


## Key Enhancements

✅ **Zod Runtime Validation**: Every type has a corresponding Zod schema  
✅ **Safe Transformations**: Built-in `safeTransform*` functions with error handling  
✅ **Validation Helpers**: `validate.host(data)` and `safeParse.user(data)` utilities  
✅ **Form Integration Ready**: Works with `zodResolver` for React Hook Form  
✅ **Better Error Messages**: Clear validation errors instead of runtime crashes

## Usage

### In Backend Code (with Validation)

```typescript
import { Host, HostSchema, validate } from '@stay-with-friends/shared-types';

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
import { Host, safeParse, HostSchema } from '@stay-with-friends/shared-types';
import { zodResolver } from '@hookform/resolvers/zod';

// Automatic form validation
const form = useForm<Host>({
  resolver: zodResolver(HostSchema) // ✅ Shared schema usage!
});

// Safe transformation from API data
const handleApiResponse = async () => {
  const backendHost = await fetch('/api/hosts/1').then(r => r.json());
  
  const parseResult = safeParse.host(backendHost);
  if (parseResult.success) {
    setHost(parseResult.data); // ✅ Properly typed & validated
  } else {
    setError(parseResult.error); // ✅ Clear error message
  }
};
```

### Adding New Fields

1. Update `packages/shared-types/src/entities.ts`:
2. Types are automatically updated in both backend and frontend!

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
4. 🛡️ **API Safety**: Use `safeParse.host(apiData)` for safe transformations

No breaking changes - just additional superpowers when you need them!
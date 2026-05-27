# Pre-commit Rules for Type-Checking React & TypeScript

To maintain absolute type-safety in the frontend, all changes to React components and TypeScript files under `resources/js` or `frontend/` must satisfy strict criteria before they can be committed to the repository.

---

## 1. Automated Pre-Commit Hook Configuration

We utilize **Husky** and **lint-staged** to intercept commit attempts. The following hook operates on any staged files:

```bash
# .husky/pre-commit
npx lint-staged
```

### `lint-staged.config.js` Action Map
For files in the Laravel Inertia React frontend (`resources/js/`):
```javascript
module.exports = {
  'resources/js/**/*.{ts,tsx}': [
    'tsc --noEmit --project tsconfig.json',
    'eslint --fix',
    'prettier --write'
  ]
}
```

For files in the separate TanStack Start frontend (`frontend/`):
```javascript
module.exports = {
  'frontend/**/*.{ts,tsx}': [
    'npm --prefix frontend run lint',
    'npm --prefix frontend run format'
  ]
}
```

---

## 2. Strict Frontend Type Standards

### No Implicit `any`
The TypeScript compilers are locked to strict mode (`"strict": true`).
- Any use of `any` as a type declaration will fail the compiler check.
- Use explicit types, interfaces, or generic interfaces for all components and utility helper files.
- If a type is unknown, use the `unknown` type and verify via a type guard before usage.

### Component Interfaces
Every component must explicitly declare its props format:
```tsx
// ❌ BAD
export default function UserCard({ user }) {
  return <div>{user.name}</div>;
}

//  GOOD
interface User {
  id: number;
  name: string;
  email: string;
}

interface UserCardProps {
  user: User;
  onSelect?: (userId: number) => void;
}

export default function UserCard({ user, onSelect }: UserCardProps) {
  return (
    <div className="p-4 border rounded shadow-sm hover:shadow-md transition">
      <h3 className="font-semibold text-lg">{user.name}</h3>
      <p className="text-gray-500 text-sm">{user.email}</p>
      {onSelect && (
        <button 
          onClick={() => onSelect(user.id)}
          className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded text-sm"
        >
          View Profile
        </button>
      )}
    </div>
  );
}
```

### Inertia Page Props & Ziggy Type Safety
- Make sure props passed down from controllers through Inertia match the frontend interfaces. Use generated types if utilizing tools like `spatie/laravel-typescript-transformer`.
- When utilizing routes in React, import the typed Ziggy route generator (`route(...)`) to prevent invalid route calls:
```tsx
import { route } from 'ziggy-js';

// Fully type-checked route parameters
const url = route('attendance.show', { id: recordId });
```
---

## 3. Override Safeguard

If a critical deployment emergency requires bypassing type-checking (e.g. out-of-band hotfix), append `--no-verify` to your commit command.
> [!WARNING]
> Bypassing pre-commit hooks is logged in CI and should only be performed during critical out-of-band updates. Normal commits should always satisfy these standards.

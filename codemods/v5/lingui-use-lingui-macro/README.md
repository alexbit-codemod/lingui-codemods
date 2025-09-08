# lingui-use-lingui-macro

Migrate from `t(i18n)` pattern to `useLingui` macro for non-JSX messages in React components

## Usage

This codemod transforms TypeScript/JavaScript code by replacing the older pattern of mixing `t` from `@lingui/macro` with `useLingui` from `@lingui/react` to the new simplified `useLingui` macro pattern.

### Transformation

**Before:**
```typescript
import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";

function MyComponent() {
  const { i18n, _ } = useLingui();
  const a = t(i18n)`Text`;
}
```

**After:**
```typescript
import { useLingui } from "@lingui/react/macro";

function MyComponent() {
  const { t } = useLingui();
  const a = t`Text`;
}
```

### What it does

1. **Import changes:**
   - Removes `t` from `@lingui/macro` imports
   - Changes `useLingui` import from `@lingui/react` to `@lingui/react/macro`
   - Keeps other imports from `@lingui/macro` unchanged

2. **Destructuring updates:**
   - Adds `t` to the `useLingui()` destructuring
   - Preserves existing destructured variables like `i18n`, `_`, etc.

3. **Usage simplification:**
   - Replaces `t(i18n)` calls with `t`
   - Maintains template literal syntax

### Examples

**Mixed imports:**
```diff
-import { t, msg } from "@lingui/macro";
-import { useLingui } from "@lingui/react";
+import { msg } from "@lingui/macro";
+import { useLingui } from "@lingui/react/macro";

function Component() {
-  const { i18n } = useLingui();
+  const { t, i18n } = useLingui();
-  const message = t(i18n)`Hello world`;
+  const message = t`Hello world`;
  const otherMessage = msg`Static message`;
}
```

**Already has t in destructuring:**
```diff
-import { t } from "@lingui/macro";
-import { useLingui } from "@lingui/react";
+import { useLingui } from "@lingui/react/macro";

function Component() {
-  const { t, i18n } = useLingui();
+  const { t, i18n } = useLingui();
-  const text = t(i18n)`Already has t`;
+  const text = t`Already has t`;
}
```

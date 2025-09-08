# lingui-macro-split

Migrate from deprecated @lingui/macro to split @lingui/react/macro and @lingui/core/macro packages


## Usage

This codemod transforms TypeScript/JavaScript code by splitting imports from the deprecated `@lingui/macro` package into the new split packages:

- **React macros** (`Trans`, `Plural`, `Select`, `SelectOrdinal`, `I18n`, `Date`, `Number`, `Time`, `RelativeTime`) → `@lingui/react/macro`
- **Core macros** (`t`, `msg`, `plural`, `select`, `selectOrdinal`, `i18n`, `date`, `number`, `time`, `relativeTime`) → `@lingui/core/macro`
- **Other imports** remain with `@lingui/macro` (for now)

### Example

**Before:**
```typescript
import { Trans, t, Plural, msg } from "@lingui/macro";
```

**After:**
```typescript
import { Trans, Plural } from "@lingui/react/macro";
import { t, msg } from "@lingui/core/macro";
```


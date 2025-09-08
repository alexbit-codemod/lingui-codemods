// Test case: Mixed imports with both React and core macros
import { t, plural, Trans, Plural } from "@lingui/macro";

// Test case: Only core macros
import { msg, select, i18n } from "@lingui/macro";

// Test case: Only React macros
import { Select, SelectOrdinal } from "@lingui/macro";

// Test case: Aliased imports
import { t as translate, Trans as Translation } from "@lingui/macro";

// Test case: Only unrecognized imports (should keep with @lingui/macro)
import { someUnknownMacro } from "@lingui/macro";

// Usage examples
const message = t`Hello world`;
const pluralMessage = plural(count, {
  one: "One item",
  other: "# items"
});

const jsx = (
  <Trans>Hello world</Trans>
);

const pluralJsx = (
  <Plural value={count} one="One item" other="# items" />
);

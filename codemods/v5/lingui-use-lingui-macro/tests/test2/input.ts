import { msg } from "@lingui/macro";
import { useLingui } from "@lingui/react";
function MyComponent() {
  const { _ } = useLingui();
  const b = _(msg`Text`);
}
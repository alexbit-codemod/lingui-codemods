import { useLingui } from "@lingui/react/macro";
function MyComponent() {
  const { t } = useLingui();
  const b = t`Text`;
}
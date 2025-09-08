import { useLingui } from "@lingui/react/macro";
function MyComponent() {
  const { t } = useLingui();
  const a = t`Text`;
}
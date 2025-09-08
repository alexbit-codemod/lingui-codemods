import { t } from "@lingui/macro";
import { useLingui } from "@lingui/react";

function MyComponent() {
  const { i18n } = useLingui();

  const a = t(i18n)`Text`;

}

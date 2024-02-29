import { and, isBooleanControl, optionIs, rankWith } from "@jsonforms/core";
import { withJsonFormsCellProps } from "@jsonforms/react";

import TailwindToggleRenderer from "../renderers/TailwindToggleRenderer";

export const tailwindBooleanToggleCellTester = rankWith(1003, and(isBooleanControl, optionIs("toggle", true)));

export const TailwindBooleanToggleCell = withJsonFormsCellProps(TailwindToggleRenderer);

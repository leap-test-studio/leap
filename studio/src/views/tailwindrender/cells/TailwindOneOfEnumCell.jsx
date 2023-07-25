import { isOneOfEnumControl, rankWith } from "@jsonforms/core";
import { withJsonFormsCellProps } from "@jsonforms/react";
import TailwindSelectRenderer from "../renderers/TailwindSelectRenderer";

export const tailwindOneOfEnumCellTester = rankWith(1002, isOneOfEnumControl);

export const TailwindOneOfEnumCell = withJsonFormsCellProps(TailwindSelectRenderer);

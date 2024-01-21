import { isBooleanControl, rankWith } from "@jsonforms/core";
import { withJsonFormsCellProps } from "@jsonforms/react";
import TailwindCheckboxRenderer from "../renderers/TailwindCheckboxRenderer";

export const tailwindBooleanCellTester = rankWith(1002, isBooleanControl);

export const TailwindBooleanCell = withJsonFormsCellProps(TailwindCheckboxRenderer);

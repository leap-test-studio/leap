import { isEnumControl, rankWith } from "@jsonforms/core";
import { withJsonFormsEnumCellProps } from "@jsonforms/react";
import TailwindSelectRenderer from "../renderers/TailwindSelectRenderer";

export const tailwindEnumCellTester = rankWith(1002, isEnumControl);

export const TailwindEnumCell = withJsonFormsEnumCellProps(TailwindSelectRenderer);

import { isNumberFormatControl, rankWith } from "@jsonforms/core";
import { withJsonFormsCellProps } from "@jsonforms/react";
import { TailwindInputNumberFormat } from "../renderers/TailwindInputNumberFormat";

export const tailwindNumberFormatCellTester = rankWith(1004, isNumberFormatControl);

export const TailwindNumberFormatCell = withJsonFormsCellProps(TailwindInputNumberFormat);

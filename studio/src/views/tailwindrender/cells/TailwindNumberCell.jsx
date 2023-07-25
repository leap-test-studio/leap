import { isNumberControl, rankWith } from "@jsonforms/core";
import { withJsonFormsCellProps } from "@jsonforms/react";
import TailwindInputNumber from "../renderers/TailwindInputNumber";

export const tailwindNumberCellTester = rankWith(1002, isNumberControl);

export const TailwindNumberCell = withJsonFormsCellProps(TailwindInputNumber);

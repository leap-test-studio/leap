import { isStringControl, rankWith } from "@jsonforms/core";
import { withJsonFormsCellProps } from "@jsonforms/react";

import TailwindInputText from "../renderers/TailwindInputText";

export const tailwindTextCellTester = rankWith(1001, isStringControl);

export const TailwindTextCell = withJsonFormsCellProps(TailwindInputText);

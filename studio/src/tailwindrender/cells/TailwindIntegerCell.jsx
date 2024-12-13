import { isIntegerControl, rankWith } from "@jsonforms/core";
import { withJsonFormsCellProps } from "@jsonforms/react";

import TailwindInputInteger from "../renderers/TailwindInputInteger";

export const tailwindIntegerCellTester = rankWith(1002, isIntegerControl);

export const TailwindIntegerCell = withJsonFormsCellProps(TailwindInputInteger);

import { and, isStringControl, optionIs, rankWith } from "@jsonforms/core";
import { withJsonFormsCellProps } from "@jsonforms/react";

import TailwindInputText from "../renderers/TailwindInputText";
import TailwindCronRenderer from "../renderers/TailwindCronRenderer";

export const tailwindCronCellTester = rankWith(1002, and(isStringControl, optionIs("format", "cron")));

export const TailwindCronCell = withJsonFormsCellProps(TailwindCronRenderer);

export const tailwindTextCellTester = rankWith(1001, isStringControl);

export const TailwindTextCell = withJsonFormsCellProps(TailwindInputText);

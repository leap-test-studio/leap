import { isStringControl, rankWith, and, optionIs, or } from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";

import TailwindInputText from "../renderers/TailwindInputText";
import TailwindCronRenderer from "../renderers/TailwindCronRenderer";

export const tailwindCronControlTester = rankWith(1002, and(isStringControl, optionIs("format", "cron")));

export const TailwindCronControl = withJsonFormsControlProps(TailwindCronRenderer);

export const tailwindTextControlTester = rankWith(1001, or(isStringControl, optionIs("format", "bytes")));

export const TailwindTextControl = withJsonFormsControlProps(TailwindInputText);

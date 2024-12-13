import { isBooleanControl, rankWith } from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";

import TailwindCheckboxRenderer from "../renderers/TailwindCheckboxRenderer";

export const tailwindBooleanControlTester = rankWith(1002, isBooleanControl);

export const TailwindBooleanControl = withJsonFormsControlProps(TailwindCheckboxRenderer);

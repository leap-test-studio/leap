import { isStringControl, rankWith, optionIs, and } from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";

import TailwindInputJson from "../renderers/TailwindInputJson";

export const tailwindJsonControlTester = rankWith(1001, and(isStringControl, optionIs("format", "json")));

export const TailwindJsonControl = withJsonFormsControlProps(TailwindInputJson);

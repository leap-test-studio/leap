import { isNumberControl, rankWith } from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";
import TailwindInputNumber from "../renderers/TailwindInputNumber";

export const tailwindNumberControlTester = rankWith(1002, isNumberControl);

export const TailwindNumberControl = withJsonFormsControlProps(TailwindInputNumber);

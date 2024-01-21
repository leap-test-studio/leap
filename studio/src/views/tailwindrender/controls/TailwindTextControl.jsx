import { isStringControl, rankWith, or, optionIs } from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";
import TailwindInputText from "../renderers/TailwindInputText";

export const tailwindTextControlTester = rankWith(1001, or(isStringControl, optionIs("format", "bytes")));

export const TailwindTextControl = withJsonFormsControlProps(TailwindInputText);

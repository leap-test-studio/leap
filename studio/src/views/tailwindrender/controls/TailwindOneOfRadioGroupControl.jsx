import { and, isOneOfEnumControl, optionIs, rankWith } from "@jsonforms/core";
import { withJsonFormsOneOfEnumProps } from "@jsonforms/react";
import TailwindRadioGroupRenderer from "../renderers/TailwindRadioGroupRenderer";

export const tailwindOneOfRadioGroupControlTester = rankWith(1020, and(isOneOfEnumControl, optionIs("format", "radio")));

export const TailwindOneOfRadioGroupControl = withJsonFormsOneOfEnumProps(TailwindRadioGroupRenderer);

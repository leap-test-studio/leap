import { and, isEnumControl, optionIs, rankWith } from "@jsonforms/core";
import { withJsonFormsEnumProps } from "@jsonforms/react";
import TailwindRadioGroupRenderer from "../renderers/TailwindRadioGroupRenderer";

export const tailwindRadioGroupControlTester = rankWith(1020, and(isEnumControl, optionIs("format", "radio")));

export const TailwindRadioGroupControl = withJsonFormsEnumProps(TailwindRadioGroupRenderer);

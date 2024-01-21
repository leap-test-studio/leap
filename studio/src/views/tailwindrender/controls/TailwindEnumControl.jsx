import { isEnumControl, rankWith } from "@jsonforms/core";
import { withJsonFormsEnumProps } from "@jsonforms/react";
import TailwindSelectRenderer from "../renderers/TailwindSelectRenderer";

export const tailwindEnumTester = rankWith(1002, isEnumControl);

export const TailwindEnumControl = withJsonFormsEnumProps(TailwindSelectRenderer);

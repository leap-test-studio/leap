import { isIntegerControl, rankWith } from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";
import TailwindInputInteger from "../renderers/TailwindInputInteger";

export const tailwindIntegerControlTester = rankWith(1002, isIntegerControl);

export const TailwindIntegerControl = withJsonFormsControlProps(TailwindInputInteger);

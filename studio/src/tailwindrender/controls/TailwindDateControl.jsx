import React from "react";
import { isDateControl, rankWith } from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";

import TailwindDateRenderer from "../renderers/TailwindDateRenderer";

/**
 * Default renderer for a date- yyyy-MM-dd.
 */
const TailwindDate = React.memo((props) => {
  return <TailwindDateRenderer {...props} format="YYYY-MM-DD" placeholderText="Select date" />;
});

export const tailwindDateControlTester = rankWith(1004, isDateControl);

export const TailwindDateControl = withJsonFormsControlProps(TailwindDate);

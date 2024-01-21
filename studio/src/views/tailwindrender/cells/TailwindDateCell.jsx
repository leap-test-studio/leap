import React from "react";
import { isDateControl, rankWith } from "@jsonforms/core";
import { withJsonFormsCellProps } from "@jsonforms/react";
import TailwindDateRenderer from "../renderers/TailwindDateRenderer";

/**
 * Default renderer for a date- yyyy-MM-dd.
 */
const TailwindDate = React.memo((props) => {
  return <TailwindDateRenderer {...props} label={null} format="YYYY-MM-DD" placeholderText="Select date" />;
});

export const tailwindDateCellTester = rankWith(1002, isDateControl);

export const TailwindDateCell = withJsonFormsCellProps(TailwindDate);

import React from "react";
import { isDateTimeControl, rankWith } from "@jsonforms/core";
import { withJsonFormsCellProps } from "@jsonforms/react";
import TailwindDateRenderer from "../renderers/TailwindDateRenderer";

/**
 * Default renderer for a date- yyyy-MM-dd HH:mm:ss.
 */
const TailwindDateTime = React.memo((props) => {
  return <TailwindDateRenderer {...props} label={null} format="YYYY-MM-DD HH:mm:ss" placeholderText="Select date" />;
});

export const tailwindDateTimeCellTester = rankWith(1002, isDateTimeControl);

export const TailwindDateTimeCell = withJsonFormsCellProps(TailwindDateTime);

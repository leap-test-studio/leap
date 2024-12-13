import React from "react";
import { isTimeControl, rankWith } from "@jsonforms/core";
import { withJsonFormsCellProps } from "@jsonforms/react";

import TailwindDateRenderer from "../renderers/TailwindDateRenderer";

/**
 * Default renderer for a date- HH:mm:ss .
 */
const TailwindTime = React.memo((props) => {
  return (
    <TailwindDateRenderer {...props} label={null} format="HH:mm:ss" placeholderText="Select time" showTimeSelect={true} showTimeSelectOnly={true} />
  );
});

export const tailwindTimeCellTester = rankWith(1002, isTimeControl);

export const TailwindTimeCell = withJsonFormsCellProps(TailwindTime);

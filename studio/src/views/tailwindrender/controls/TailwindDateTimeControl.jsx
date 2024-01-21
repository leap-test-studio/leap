import React from "react";
import { isDateTimeControl, rankWith } from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";

import TailwindDateRenderer from "../renderers/TailwindDateRenderer";

/**
 * Default renderer for a date- yyyy-MM-DD HH:mm:ss .
 */
const TailwindDateTime = React.memo((props) => {
  return <TailwindDateRenderer {...props} format="YYYY-MM-DD HH:mm:ss" placeholderText="Select date and time" showTimeSelect={true} />;
});

export const tailwindDateTimeControlTester = rankWith(1002, isDateTimeControl);

export const TailwindDateTimeControl = withJsonFormsControlProps(TailwindDateTime);

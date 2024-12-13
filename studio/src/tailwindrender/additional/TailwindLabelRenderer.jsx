import { rankWith, uiTypeIs } from "@jsonforms/core";
import { withJsonFormsLayoutProps } from "@jsonforms/react";

/**
 * Default renderer for a label.
 */
const TailwindLabelRenderer = ({ uischema, visible, path }) => {
  if (!visible || uischema.text == undefined) return null;
  return (
    <div htmlFor={path} className="text-base text-color-0700 w-full">
      <label>{uischema.text}</label>
    </div>
  );
};

export const tailwindLabelTester = rankWith(1001, uiTypeIs("Label"));

export const TailwindLabel = withJsonFormsLayoutProps(TailwindLabelRenderer);

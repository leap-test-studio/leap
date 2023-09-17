import { rankWith, uiTypeIs } from "@jsonforms/core";
import { withJsonFormsLayoutProps } from "@jsonforms/react";

/**
 * Default renderer for a label.
 */
const TailwindLabelRenderer = ({ uischema, visible, path }) => {
  const labelElement = uischema;
  return (
    <>
      {visible && (
        <div htmlFor={path} className="text-base text-color-0700 w-full">
          <label>{labelElement.text !== undefined && labelElement.text !== null && labelElement.text}</label>
        </div>
      )}
    </>
  );
};

export const tailwindLabelTester = rankWith(1001, uiTypeIs("Label"));

export const TailwindLabel = withJsonFormsLayoutProps(TailwindLabelRenderer);

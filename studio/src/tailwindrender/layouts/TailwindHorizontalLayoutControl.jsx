import { rankWith, uiTypeIs } from "@jsonforms/core";
import { withJsonFormsLayoutProps } from "@jsonforms/react";

import { TailwindLayoutRenderer } from "../util";

const TailwindHorizontalLayoutRenderer = ({ uischema, renderers, cells, schema, path, enabled, visible }) => {
  const childProps = {
    elements: uischema.elements,
    schema,
    path,
    enabled,
    direction: "row",
    visible
  };
  return <TailwindLayoutRenderer layout="horizontal" {...childProps} renderers={renderers} cells={cells} {...uischema.options} />;
};

export const tailwindHorizontalLayoutTester = rankWith(1002, uiTypeIs("HorizontalLayout"));

export const TailwindHorizontalLayoutControl = withJsonFormsLayoutProps(TailwindHorizontalLayoutRenderer);

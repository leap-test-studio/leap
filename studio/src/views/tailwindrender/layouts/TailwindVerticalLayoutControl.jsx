import { rankWith, uiTypeIs } from "@jsonforms/core";
import { withJsonFormsLayoutProps } from "@jsonforms/react";
import { TailwindLayoutRenderer } from "../util";

const TailwindVerticalLayoutRenderer = ({ uischema, renderers, cells, schema, path, enabled, visible }) => {
  const childProps = {
    elements: uischema.elements,
    schema,
    path,
    enabled,
    direction: "column",
    visible
  };
  return <TailwindLayoutRenderer layout="vertical" {...childProps} renderers={renderers} cells={cells} />;
};

export const tailwindVerticalLayoutTester = rankWith(1001, uiTypeIs("VerticalLayout"));

export const TailwindVerticalLayoutControl = withJsonFormsLayoutProps(TailwindVerticalLayoutRenderer);

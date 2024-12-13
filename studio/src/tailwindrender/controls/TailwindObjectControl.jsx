import React from "react";
import { Generate, isObjectControl, rankWith } from "@jsonforms/core";
import { JsonFormsDispatch, withJsonFormsDetailProps } from "@jsonforms/react";
import isEmpty from "lodash/isEmpty";

const TailwindObjectRenderer = React.memo(({ renderers, cells, schema, label, path, visible, enabled }) => {
  const detailUiSchema = isEmpty(path) ? Generate.uiSchema(schema, "VerticalLayout") : { ...Generate.uiSchema(schema, "Group"), label };

  if (!visible) return null;

  return (
    <JsonFormsDispatch
      visible={visible}
      enabled={enabled}
      schema={schema}
      uischema={detailUiSchema}
      path={path}
      renderers={renderers}
      cells={cells}
    />
  );
});

export const tailwindObjectControlTester = rankWith(1002, isObjectControl);

export const TailwindObjectControl = withJsonFormsDetailProps(TailwindObjectRenderer);

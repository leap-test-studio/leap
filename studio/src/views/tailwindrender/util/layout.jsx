import React from "react";
import { JsonFormsDispatch, useJsonForms } from "@jsonforms/react";
import { getAjv } from "@jsonforms/core";
import isEmpty from "lodash/isEmpty";

export const TailwindLayoutRenderer = React.memo(({ id, layout, visible, elements, schema, path, enabled, direction, renderers, cells }) => {
  if (isEmpty(elements)) return null;
  return (
    <>
      {visible && (
        <div
          id={id}
          my-name={layout}
          className={`w-full p-1 ${
            direction === "column"
              ? "flex flex-col"
              : elements.length >= 4
              ? "grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
              : elements.length >= 2
              ? "grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2"
              : "flex flex-col"
          }`}
        >
          {renderLayoutElements(elements, schema, path, enabled, renderers, cells)}
        </div>
      )}
    </>
  );
});

export const withAjvProps = (Component) => (props) => {
  const ctx = useJsonForms();
  const ajv = getAjv({ jsonforms: { ...ctx } });

  return <Component {...props} ajv={ajv} />;
};

const renderLayoutElements = (elements, schema, path, enabled, renderers, cells) => {
  return (
    Array.isArray(elements) &&
    elements.map((child, index) => {
      return (
        <JsonFormsDispatch
          key={`${path}-${index}`}
          uischema={child}
          schema={schema}
          path={path}
          enabled={enabled}
          renderers={renderers}
          cells={cells}
        />
      );
    })
  );
};

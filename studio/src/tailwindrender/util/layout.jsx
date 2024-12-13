import React from "react";
import { JsonFormsDispatch, useJsonForms } from "@jsonforms/react";
import { getAjv } from "@jsonforms/core";
import isEmpty from "lodash/isEmpty";

export const TailwindLayoutRenderer = React.memo(
  ({ id, layout, visible, elements, schema, path, enabled, direction, renderers, cells, columns = 2 }) => {
    if (isEmpty(elements)) return null;
    return (
      <>
        {visible && (
          <div
            id={id}
            my-name={layout}
            className={`w-full p-0.5 ${
              direction === "column"
                ? "grid grid-cols-1 gap-y-[2px]"
                : elements.length >= 4
                  ? "grid grid-cols-4 place-items-stretch gap-[2px]"
                  : elements.length >= 2
                    ? `grid ${columns === 3 ? "grid-cols-3" : "grid-cols-2"} place-items-stretch gap-[2px]`
                    : "flex flex-col"
            }`}
          >
            {renderLayoutElements(elements, schema, path, enabled, renderers, cells)}
          </div>
        )}
      </>
    );
  }
);

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

import React from "react";
import { and, hasType, Paths, rankWith, schemaMatches, schemaSubPathMatches, uiTypeIs } from "@jsonforms/core";
import { withJsonFormsMultiEnumProps } from "@jsonforms/react";
import isEmpty from "lodash/isEmpty";
import startCase from "lodash/startCase";

import TailwindCheckboxRenderer from "./TailwindCheckboxRenderer";
import ErrorMessage from "./common/ErrorMessage";

/**
 * Default renderer for a enum array.
 */
const TailwindEnumArrayRenderer = React.memo(
  ({ id, schema, visible, errors, path, options, data, addItem, removeItem, handleChange, ...otherProps }) => {
    if (!visible) return null;
    return (
      <div className="grow w-full mb-1.5">
        <div className="group block rounded shadow group-hover:shadow-lg w-full mt-1 bg-slate-50">
          {otherProps.label?.length > 0 && (
            <div className="px-1.5 py-0.5 border-b bg-color-0100 hover:bg-color-0200 focus:outline-none focus-visible:ring focus-visible:ring-color-0500 focus-visible:ring-opacity-75 rounded-t">
              <label className="text-color-primary text-xs tracking-wide select-none">{otherProps.label}</label>
            </div>
          )}
          <div className="grid gap-x-1 gap-y-0 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full p-2 pb-0">
            {Array.isArray(options) &&
              options.map((option, index) => {
                const optionPath = Paths.compose(path, `${index}`);
                const checkboxValue = data?.includes(option.value) ? option.value : undefined;
                otherProps.label = startCase(option.label);
                return (
                  <TailwindCheckboxRenderer
                    key={`checkbox-${option.value}`}
                    isValid={isEmpty(errors)}
                    path={optionPath}
                    handleChange={(_childPath, newValue) => (newValue ? addItem(path, option.value) : removeItem(path, option.value))}
                    data={checkboxValue}
                    errors={errors}
                    schema={schema}
                    visible={visible}
                    removeMt={true}
                    {...otherProps}
                  />
                );
              })}
          </div>
          <ErrorMessage id={id} path={path} errors={errors} />
        </div>
      </div>
    );
  }
);

const hasOneOfItems = (schema) =>
  schema.oneOf !== undefined &&
  schema.oneOf.length > 0 &&
  schema.oneOf.every((entry) => {
    return entry.const !== undefined;
  });

const hasEnumItems = (schema) => schema.type === "string" && schema.enum !== undefined;

export const tailwindEnumArrayControlTester = rankWith(
  1005,
  and(
    uiTypeIs("Control"),
    and(
      schemaMatches((schema) => hasType(schema, "array") && !Array.isArray(schema.items) && schema.uniqueItems === true),
      schemaSubPathMatches("items", (schema) => {
        return hasOneOfItems(schema) || hasEnumItems(schema);
      })
    )
  )
);

export const TailwindEnumArrayControl = withJsonFormsMultiEnumProps(TailwindEnumArrayRenderer);

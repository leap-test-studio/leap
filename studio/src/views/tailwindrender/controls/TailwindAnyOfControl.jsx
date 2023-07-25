import React, { useCallback, useState } from "react";
import { createCombinatorRenderInfos, isAnyOfControl, rankWith } from "@jsonforms/core";
import { withJsonFormsAnyOfProps } from "@jsonforms/react";
import TabRenderer from "../renderers/common/TabRenderer";
import ErrorMessage from "../renderers/common/ErrorMessage";

const TailwindAnyOfRenderer = React.memo(
  ({ schema, rootSchema, indexOfFittingSchema, visible, path, renderers, cells, uischema, uischemas, errors }) => {
    const [selectedAnyOf, setSelectedAnyOf] = useState(indexOfFittingSchema || 0);
    const handleChange = useCallback((value) => setSelectedAnyOf(value), [setSelectedAnyOf]);
    const anyOf = "anyOf";
    const anyOfRenderInfos = createCombinatorRenderInfos(schema.anyOf, rootSchema, anyOf, uischema, path, uischemas);
    return (
      <>
        {visible && (
          <div className="flex w-full mb-2">
            <div className="group block rounded shadow group-hover:shadow-lg w-full mt-1 bg-slate-50">
              {uischema.label?.length > 0 && (
                <div className="px-2 py-1 bg-color-0100 hover:bg-color-0200 focus:outline-none focus-visible:ring focus-visible:ring-color-0500 focus-visible:ring-opacity-75 rounded-t">
                  <label className="text-color-primary text-sm tracking-wide select-none">{uischema.label}</label>
                </div>
              )}
              <TabRenderer
                selected={selectedAnyOf}
                onChange={handleChange}
                infos={anyOfRenderInfos}
                path={path}
                renderers={renderers}
                cells={cells}
              />
              <ErrorMessage path={path} errors={errors} />
            </div>
          </div>
        )}
      </>
    );
  }
);

export const tailwindAnyOfControlTester = rankWith(1003, isAnyOfControl);

export const TailwindAnyOfControl = withJsonFormsAnyOfProps(TailwindAnyOfRenderer);

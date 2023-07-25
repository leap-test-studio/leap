import React from "react";
import { createCombinatorRenderInfos, findMatchingUISchema, isAllOfControl, rankWith } from "@jsonforms/core";
import { JsonFormsDispatch, withJsonFormsAllOfProps } from "@jsonforms/react";
import ErrorMessage from "../renderers/common/ErrorMessage";
import isEmpty from "lodash/isEmpty";

const TailwindAllOfRenderer = React.memo(({ schema, rootSchema, visible, renderers, cells, path, uischemas, uischema, errors }) => {
  const delegateUISchema = findMatchingUISchema(uischemas)(schema, uischema.scope, path);
  if (delegateUISchema) {
    return <>{visible && <JsonFormsDispatch schema={schema} uischema={delegateUISchema} path={path} renderers={renderers} cells={cells} />}</>;
  }
  const allOfRenderInfos = createCombinatorRenderInfos(schema.allOf, rootSchema, "allOf", uischema, path, uischemas);
  if (!Array.isArray(allOfRenderInfos) || isEmpty(allOfRenderInfos)) return null;
  return (
    <>
      {visible && (
        <div className="grow w-full mb-1.5">
          <div className="w-full flex flex-col rounded border mt-0.5">
            {uischema.label?.length > 0 && (
              <div className="bg-color-0100 text-left text-sm text-color-primary select-none p-0.5 pl-2 rounded-t">{uischema.label}</div>
            )}
            <div
              className={`w-full p-1 ${
                allOfRenderInfos.length >= 4
                  ? "grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
                  : allOfRenderInfos.length >= 2
                  ? "grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2"
                  : "flex flex-col"
              }`}
            >
              {allOfRenderInfos.map((allOfRenderInfo, allOfIndex) => (
                <div className={allOfRenderInfo.schema.oneOf ? (allOfRenderInfos.length >= 4 ? "col-span-4" : "col-span-2") : ""}>
                  <JsonFormsDispatch
                    key={allOfIndex}
                    schema={allOfRenderInfo.schema}
                    uischema={allOfRenderInfo.uischema}
                    path={path}
                    renderers={renderers}
                    cells={cells}
                  />
                </div>
              ))}
            </div>
            {/* ------------ For Future Use ------------ */}
            {/* <ErrorMessage path={path} errors={errors} /> */}
          </div>
        </div>
      )}
    </>
  );
});

export const tailwindAllOfControlTester = rankWith(1003, isAllOfControl);

export const TailwindAllOfControl = withJsonFormsAllOfProps(TailwindAllOfRenderer);

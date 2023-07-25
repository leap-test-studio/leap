import { TailwindLayoutRenderer } from "../util/layout";
import { rankWith, uiTypeIs, withIncreasedRank } from "@jsonforms/core";
import { withJsonFormsLayoutProps } from "@jsonforms/react";

const TailwindCustomGroupLayout = ({ uischema, schema, path, visible, enabled, renderers, cells, direction }) => {
  return (
    <>
      {visible && uischema && (
        <div className="w-full flex flex-col rounded border my-0.5">
          {uischema.label?.length > 0 && (
            <span className="bg-color-0100 text-left text-sm text-color-primary select-none p-0.5 pl-2 rounded-t">{uischema.label}</span>
          )}
          <TailwindLayoutRenderer
            layout="group"
            schema={schema}
            path={path}
            elements={uischema.elements}
            direction={direction}
            renderers={renderers}
            cells={cells}
            visible={visible}
            enabled={enabled}
          />
        </div>
      )}
    </>
  );
};

export const TailwindCustomGroupLayoutControl = withJsonFormsLayoutProps(TailwindCustomGroupLayout);

export const tailwindCustomGroupLayoutControlTester = withIncreasedRank(1, rankWith(1001, uiTypeIs("CustomGroup")));

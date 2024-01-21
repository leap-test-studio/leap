import { useCallback } from "react";
import { isObjectArrayWithNesting, rankWith } from "@jsonforms/core";
import { TailwindArrayLayout } from "./TailwindArrayLayout";
import { withJsonFormsArrayProps } from "../common/JsonFormsArrayProps";

const TailwindArrayLayoutRenderer = ({
  visible,
  enabled,
  id,
  uischema,
  schema,
  label,
  rootSchema,
  renderers,
  cells,
  data,
  path,
  errors,
  uischemas,
  addItem,
  ctx
}) => {
  const addItemCb = useCallback((p, value) => addItem(p, value), [addItem]);

  return (
    <>
      {visible && (
        <TailwindArrayLayout
          label={label}
          uischema={uischema}
          schema={schema}
          id={id}
          rootSchema={rootSchema}
          errors={errors}
          enabled={enabled}
          visible={visible}
          data={data}
          path={path}
          addItem={addItemCb}
          renderers={renderers}
          cells={cells}
          uischemas={uischemas}
          readonly={ctx?.readonly}
        />
      )}
    </>
  );
};

export const tailwindArrayLayoutControlTester = rankWith(1004, isObjectArrayWithNesting);

export const TailwindArrayLayoutControl = withJsonFormsArrayProps(TailwindArrayLayoutRenderer);

import { rankWith, isPrimitiveArrayControl, resolveData } from "@jsonforms/core";

import TagsInput from "../renderers/TagsInput";
import LabelRenderer from "../renderers/common/LabelRenderer";
import { withJsonFormsArrayProps } from "../common/JsonFormsArrayProps";

export const TailwindPrimitiveArrayControlRenderer = (props) => {
  const { id, visible, ctx, path, schema, label, addItem, removeItems, description, handleChange } = props;
  if (!visible) return null;
  return (
    <div className="flex flex-col p-2 border rounded m-2">
      {label?.length > 0 && <LabelRenderer {...props} />}
      <TagsInput
        id={id}
        path={path}
        value={resolveData(ctx?.core?.data, path) || []}
        addItem={addItem}
        removeItems={removeItems}
        type={schema?.type}
        placeholder={description || "Add Item"}
        onChange={(tag) => {
          if (tag) {
            handleChange(path, tag);
          }
        }}
        readonly={ctx?.readonly}
      />
    </div>
  );
};

export const tailwindPrimitiveArrayControlTester = rankWith(1004, isPrimitiveArrayControl);

export const TailwindPrimitiveArrayControl = withJsonFormsArrayProps(TailwindPrimitiveArrayControlRenderer);

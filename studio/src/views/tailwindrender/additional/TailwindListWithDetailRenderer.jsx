import { useCallback, useMemo, useState } from "react";
import { and, composePaths, computeLabel, createDefaultValue, findUISchema, isObjectArray, rankWith, uiTypeIs } from "@jsonforms/core";
import { JsonFormsDispatch } from "@jsonforms/react";
import List from "@mui/material/List";
import merge from "lodash/merge";
import map from "lodash/map";
import range from "lodash/range";

import ListWithDetailMasterItem from "./ListWithDetailMasterItem";
import TableToolbar from "../renderers/Table/TableToolbar";
import { Centered, EmptyIconRenderer } from "../../utilities";
import { withJsonFormsArrayProps } from "../common/JsonFormsArrayProps";

const TailwindListWithDetailRenderer = ({
  uischemas,
  schema,
  uischema,
  path,
  errors,
  visible,
  label,
  required,
  removeItems,
  addItem,
  data,
  renderers,
  cells,
  config,
  ctx
}) => {
  const [selectedIndex, setSelectedIndex] = useState(undefined);

  const handleRemoveItem = useCallback(
    (p, value) => () => {
      removeItems(p, [value])();
      if (selectedIndex === value) {
        setSelectedIndex(undefined);
      } else if (selectedIndex > value) {
        setSelectedIndex(selectedIndex - 1);
      }
    },
    [removeItems, selectedIndex, setSelectedIndex]
  );
  const handleListItemClick = useCallback((index) => () => setSelectedIndex(index), [setSelectedIndex]);
  const handleCreateDefaultValue = useCallback(() => createDefaultValue(schema), [schema]);
  const foundUISchema = useMemo(
    () => findUISchema(uischemas, schema, uischema.scope, path, undefined, uischema),
    [uischemas, schema, path, uischema]
  );

  if (!visible) return null;

  const appliedUiSchemaOptions = merge({}, config, uischema.options);

  return (
    <>
      <TableToolbar
        label={computeLabel(label, required, appliedUiSchemaOptions.hideRequiredAsterisk)}
        errors={errors}
        path={path}
        addItem={addItem}
        createDefault={handleCreateDefaultValue}
        enabled={data === 0}
        schema={schema}
        readonly={ctx?.readonly}
      />
      <div className="w-full grid grid-flow-row">
        <div className="row-span-3">
          <List>
            {data > 0 ? (
              map(range(data), (index) => (
                <ListWithDetailMasterItem
                  index={index}
                  path={path}
                  schema={schema}
                  handleSelect={handleListItemClick}
                  removeItem={handleRemoveItem}
                  selected={selectedIndex === index}
                  key={index}
                />
              ))
            ) : (
              <Centered>
                <EmptyIconRenderer title="No items found" showIcon={false} />
              </Centered>
            )}
          </List>
        </div>
        {selectedIndex !== undefined && (
          <JsonFormsDispatch
            renderers={renderers}
            cells={cells}
            visible={visible}
            schema={schema}
            uischema={foundUISchema}
            path={composePaths(path, `${selectedIndex}`)}
          />
        )}
      </div>
    </>
  );
};

export const tailwindListWithDetailTester = rankWith(1004, and(uiTypeIs("ListWithDetail"), isObjectArray));

export const TailwindListWithDetail = withJsonFormsArrayProps(TailwindListWithDetailRenderer);

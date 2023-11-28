import React, { useState, useCallback } from "react";
import { composePaths, computeLabel, createDefaultValue } from "@jsonforms/core";
import TableToolbar from "../renderers/Table/TableToolbar";
import ExpandPanelRenderer from "./ExpandPanelRenderer";
import merge from "lodash/merge";
import map from "lodash/map";
import range from "lodash/range";
import EmptyIconRenderer from "../../utilities/EmptyIconRenderer";
import IconButton from "../../utilities/IconButton";
import Tooltip from "../../utilities/Tooltip";

export const TailwindArrayLayout = React.memo((props) => {
  const [expanded, setExpanded] = useState(false);
  const innerCreateDefaultValue = useCallback(() => createDefaultValue(props.schema), [props.schema]);
  const handleChange = useCallback(
    (panel) => (_event, expandedPanel) => {
      setExpanded(expandedPanel ? panel : false);
    },
    []
  );
  const isExpanded = (index) => expanded === composePaths(props.path, `${index}`);

  const { data, path, schema, uischema, errors, addItem, renderers, cells, label, required, rootSchema, config, uischemas, readonly } = props;
  const appliedUiSchemaOptions = merge({}, config, props.uischema.options);
  let showAddItem = true;
  if (!isNaN(appliedUiSchemaOptions.maximum)) {
    showAddItem = data < Number(appliedUiSchemaOptions.maximum);
  }
  return (
    <div className="mt-1">
      <TableToolbar
        label={computeLabel(label, required, appliedUiSchemaOptions.hideRequiredAsterisk)}
        errors={errors}
        path={path}
        addItem={addItem}
        createDefault={innerCreateDefaultValue}
        enabled={data === 0}
        schema={schema}
        readonly={readonly}
      />
      <div className="bg-slate-50 rounded-b p-0.5 border mb-1.5">
        {data > 0 ? (
          map(range(data), (index) => {
            return (
              <ExpandPanelRenderer
                index={index}
                expanded={isExpanded(index)}
                schema={schema}
                path={path}
                handleExpansion={handleChange}
                uischema={uischema}
                renderers={renderers}
                cells={cells}
                key={index}
                rootSchema={rootSchema}
                enableMoveUp={index !== 0}
                enableMoveDown={index < data - 1}
                config={config}
                childLabelProp={appliedUiSchemaOptions.elementLabelProp}
                uischemas={uischemas}
                readonly={readonly}
              />
            );
          })
        ) : (
          <EmptyIconRenderer title="No data found" fill="#90b6e8" showIcon={false} />
        )}
        {showAddItem && data !== 0 && (
          <div className="w-full flex flex-row justify-end text-color-0500 select-none mt-1">
            {!readonly && (
              <>
                <label className="text-[10px] text-center mt-0.5">Add a {uischema?.options?.rowTitle || "Record"}</label>
                <Tooltip id="tooltip-add" title={`Add to ${label}`} placement="left">
                  <IconButton
                    id={`add-item-${path}`}
                    icon="Add"
                    ariaLabel={`Add to ${label}`}
                    onClick={addItem(path, innerCreateDefaultValue())}
                    iconSize="20"
                    className="text-color-0800 hover:text-color-0700"
                  />
                </Tooltip>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

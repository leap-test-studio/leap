import React, { useState, useCallback } from "react";
import { composePaths, computeLabel, createDefaultValue } from "@jsonforms/core";
import merge from "lodash/merge";
import map from "lodash/map";
import range from "lodash/range";

import ExpandPanelRenderer from "./ExpandPanelRenderer";
import TableToolbar from "../renderers/Table/TableToolbar";
import { IconButton, Tooltip, EmptyIconRenderer, Centered } from "../../utilities";

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
  let showAddItem = appliedUiSchemaOptions.showAddItem != null ? appliedUiSchemaOptions.showAddItem : true;
  if (!isNaN(appliedUiSchemaOptions.maximum)) {
    showAddItem = data < Number(appliedUiSchemaOptions.maximum);
  }
  return (
    <div className="my-px border rounded">
      <TableToolbar
        label={computeLabel(label, required, appliedUiSchemaOptions.hideRequiredAsterisk)}
        labelEnd={
          <label className="text-[10px] select-none">
            <strong>{data} </strong>
            Record(s)
          </label>
        }
        errors={errors}
        path={path}
        addItem={addItem}
        createDefault={innerCreateDefaultValue}
        enabled={data === 0}
        schema={schema}
        readonly={readonly}
      />
      <div className="bg-slate-50 mb-px">
        {data > 0 ? (
          map(range(data), (index) => {
            return (
              <ExpandPanelRenderer
                index={index}
                expanded={appliedUiSchemaOptions.expand || isExpanded(index)}
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
          <Centered>
            <EmptyIconRenderer title={`No ${label}`} showIcon={false} />
          </Centered>
        )}
        {showAddItem && data !== 0 && (
          <div className="w-full flex flex-row justify-end text-color-0600 select-none mt-1">
            {!readonly && (
              <>
                <label className="text-[10px] text-center mt-0.5 mr-2">Add a {uischema?.options?.rowTitle || "Record"}</label>
                <Tooltip id="tooltip-add" title={`Add to ${label}`} placement="left">
                  <IconButton
                    id={`add-item-${path}`}
                    icon="Add"
                    ariaLabel={`Add to ${label}`}
                    onClick={addItem(path, innerCreateDefaultValue())}
                    iconSize="20"
                    className="text-color-0600 hover:text-color-0500"
                    bg="bg-white"
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

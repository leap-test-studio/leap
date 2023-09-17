import React from "react";
import { createDefaultValue } from "@jsonforms/core";
import IconButton from "../../../utilities/IconButton";
import Tooltip from "../../../utilities/Tooltip";
//import ValidationIcon from "./ValidationIcon";

const TableToolbar = React.memo(({ /*errors,*/ label, path, addItem, schema, enabled, createDefault, readonly = false }) => {
  return (
    <div className="w-full flex flex-row justify-between items-center px-2 bg-color-0100 text-color-primary rounded-t">
      <div className="flex flex-row items-center">
        <label className="text-xs tracking-wide select-none">{label}</label>
        {/**{errors.length > 0 && <ValidationIcon id="tooltip-validation" errorMessages={errors} />}**/}
      </div>
      {enabled && !readonly && (
        <div className="mt-1">
          <Tooltip id="tooltip-add" title={`Add to ${label}`} placement="left">
            <IconButton
              id={`add-first-item-${path}`}
              icon="Add"
              ariaLabel={`Add to ${label}`}
              onClick={addItem(path, createDefault !== undefined ? createDefault() : createDefaultValue(schema))}
              iconSize="20"
              className="text-color-0800 hover:text-color-0700"
            />
          </Tooltip>
        </div>
      )}
    </div>
  );
});

export default TableToolbar;

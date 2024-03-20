import React from "react";
import { createDefaultValue } from "@jsonforms/core";

import { Tooltip, IconButton } from "../../../utilities";
//import ValidationIcon from "./ValidationIcon";

const TableToolbar = React.memo(({ /*errors,*/ label, labelEnd, path, addItem, schema, enabled, createDefault, readonly = false }) => {
  return (
    <div className="w-full flex flex-row justify-between items-center bg-color-0100 text-left text-xs font-medium text-color-primary px-2 py-1 rounded-t">
      <div className="w-full flex flex-row items-center justify-between">
        <label className="text-xs tracking-wide select-none">{label}</label>
        {labelEnd}
        {/**{errors.length > 0 && <ValidationIcon id="tooltip-validation" errorMessages={errors} />}**/}
      </div>
      {enabled && !readonly && (
        <Tooltip id="tooltip-add" title={`Add to ${label}`} placement="left">
          <IconButton
            id={`add-first-item-${path}`}
            icon="Add"
            ariaLabel={`Add to ${label}`}
            onClick={addItem(path, createDefault !== undefined ? createDefault() : createDefaultValue(schema))}
            iconSize="20"
            className="text-color-0800 hover:text-color-0700 my-0.5"
            bg="bg-white"
          />
        </Tooltip>
      )}
    </div>
  );
});

export default TableToolbar;

import React from "react";
import { createDefaultValue } from "@jsonforms/core";

import { Tooltip, IconButton } from "../../../utilities";
import { CardHeader } from "../../common/CardRenderer";
//import ValidationIcon from "./ValidationIcon";

const TableToolbar = React.memo(({ /*errors,*/ label, labelEnd, path, addItem, schema, enabled, createDefault, readonly = false }) => {
  return (
    <CardHeader>
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
            className="text-color-0600 hover:text-color-0500 my-0.5"
            bg="bg-white"
          />
        </Tooltip>
      )}
    </CardHeader>
  );
});

export default TableToolbar;

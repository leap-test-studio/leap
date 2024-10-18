import React from "react";

import { IconRenderer } from "../../../utilities";

const LabelRenderer = React.memo(({ path = "", label, fontSize, description, ...props }) => {
  return (
    <div htmlFor={path} className="flex flex-row items-center justify-between text-xs font-medium text-color-label select-none mt-1">
      <div className="flex flex-row place-items-center">
        <label style={{ fontSize: fontSize !== undefined ? fontSize : "10px" }}>{label}</label>
        {showAsRequired(props) && <label className="text-red-600 items-center">*</label>}
      </div>
      <div className="flex flex-row place-items-center">
        {description && <IconRenderer icon="HelpOutlined" fontSize="10px" className="ml-1 cursor-pointer text-color-0600" tooltip={description} />}
        {props.onActionClick && (
          <IconRenderer
            icon={props.actionIcon}
            fontSize="10px"
            className="cursor-pointer ml-1 mr-2 text-color-0600"
            tooltip={props.actionTooltip}
            onClick={props.onActionClick}
          />
        )}
      </div>
    </div>
  );
});

export default LabelRenderer;

function showAsRequired(props) {
  return props?.required && !props?.config?.hideRequiredAsterisk;
}

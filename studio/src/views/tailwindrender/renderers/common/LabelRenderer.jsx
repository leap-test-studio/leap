import React from "react";

import { IconRenderer } from "../../../utilities";

const LabelRenderer = React.memo(({ path = "", label, fontSize, description, ...props }) => {
  return (
    <div htmlFor={path} className="flex items-center text-xs font-medium text-color-label select-none mt-1">
      <div className="flex">
        <label style={{ fontSize: fontSize !== undefined ? fontSize : "10px" }}>{label}</label>
        {showAsRequired(props) && <label className="text-red-600 items-center">*</label>}
      </div>
      {description && <IconRenderer icon="HelpOutlined" fontSize="8px" className="pb-0.5 ml-1 cursor-pointer" tooltip={description} />}
    </div>
  );
});

export default LabelRenderer;

function showAsRequired(props) {
  return props?.required && !props?.config?.hideRequiredAsterisk;
}
